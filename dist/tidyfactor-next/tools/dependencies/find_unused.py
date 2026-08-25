#!/usr/bin/env python3
"""
find_unused.py — Robust Dependency Usage Scanner.
Analyzes ESM imports, CommonJS require, dynamic imports, config references, and scripts.
Does NOT modify any files. Outputs structured evidence report.
"""

import os
import sys
import json
import re

CONFIG_KNOWN_PACKAGES = {
    "typescript": ["tsconfig.json", "next-env.d.ts"],
    "tailwindcss": ["tailwind.config.js", "tailwind.config.ts", "postcss.config.js"],
    "postcss": ["postcss.config.js", "postcss.config.mjs"],
    "autoprefixer": ["postcss.config.js", "postcss.config.mjs"],
    "eslint": [".eslintrc.json", ".eslintrc.js", "eslint.config.mjs"],
    "prettier": [".prettierrc", "prettier.config.js"],
    "dotenv": ["next.config.js", "scripts/"],
}

def scan_file_imports(file_path):
    imports = set()
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        # ESM: import ... from 'pkg'
        for m in re.finditer(r'''(?:import|from)\s+['"]([@\w\d_\-\/]+)['"]''', content):
            pkg = m.group(1).split('/')[0]
            if m.group(1).startswith('@'):
                parts = m.group(1).split('/')
                pkg = f"{parts[0]}/{parts[1]}" if len(parts) > 1 else parts[0]
            imports.add(pkg)
            
        # CJS: require('pkg')
        for m in re.finditer(r'''require\s*\(\s*['"]([@\w\d_\-\/]+)['"]\s*\)''', content):
            pkg = m.group(1).split('/')[0]
            if m.group(1).startswith('@'):
                parts = m.group(1).split('/')
                pkg = f"{parts[0]}/{parts[1]}" if len(parts) > 1 else parts[0]
            imports.add(pkg)
            
        # Dynamic: import('pkg')
        for m in re.finditer(r'''import\s*\(\s*['"]([@\w\d_\-\/]+)['"]\s*\)''', content):
            pkg = m.group(1).split('/')[0]
            if m.group(1).startswith('@'):
                parts = m.group(1).split('/')
                pkg = f"{parts[0]}/{parts[1]}" if len(parts) > 1 else parts[0]
            imports.add(pkg)
            
    except Exception:
        pass
    return imports

def find_unused_dependencies(project_root="."):
    root = os.path.abspath(project_root)
    pkg_json_path = os.path.join(root, "package.json")
    
    if not os.path.exists(pkg_json_path):
        return {"error": "package.json not found"}
        
    with open(pkg_json_path, "r", encoding="utf-8") as f:
        pkg_data = json.load(f)

    direct_deps = set(pkg_data.get("dependencies", {}).keys())
    dev_deps = set(pkg_data.get("devDependencies", {}).keys())
    all_declared = direct_deps | dev_deps

    # Scan all source files
    all_found_imports = set()
    code_extensions = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json"}
    
    for dirpath, dirnames, filenames in os.walk(root):
        # Exclude build and node_modules
        dirnames[:] = [d for d in dirnames if d not in ["node_modules", ".next", ".git", "dist", "build", ".turbo"]]
        for f in filenames:
            ext = os.path.splitext(f)[1].lower()
            if ext in code_extensions:
                file_path = os.path.join(dirpath, f)
                all_found_imports.update(scan_file_imports(file_path))

    # Check script references in package.json
    scripts_str = json.dumps(pkg_data.get("scripts", {}))
    
    definitely_unused = []
    possibly_unused = []
    confirmed_used = []

    for pkg in all_declared:
        # Check direct code import
        if pkg in all_found_imports:
            confirmed_used.append(pkg)
            continue
            
        # Check if used in scripts (e.g. rimraf, concurrently, prisma, tsc)
        if pkg in scripts_str or pkg.replace("@types/", "") in all_found_imports:
            confirmed_used.append(pkg)
            continue

        # Check config files
        if pkg in CONFIG_KNOWN_PACKAGES:
            config_matches = [cf for cf in CONFIG_KNOWN_PACKAGES[pkg] if os.path.exists(os.path.join(root, cf))]
            if config_matches:
                confirmed_used.append(pkg)
                continue

        # Next.js / React peer foundations are always needed
        if pkg in ["next", "react", "react-dom", "typescript", "@types/node", "@types/react"]:
            confirmed_used.append(pkg)
            continue

        if pkg.startswith("@types/"):
            possibly_unused.append({
                "package": pkg,
                "reason": "Type package without matching source import or global usage"
            })
        else:
            definitely_unused.append({
                "package": pkg,
                "type": "dependencies" if pkg in direct_deps else "devDependencies",
                "evidence": "0 imports found in all scanned source/config files"
            })

    return {
        "summary": {
            "total_declared": len(all_declared),
            "confirmed_used_count": len(confirmed_used),
            "definitely_unused_count": len(definitely_unused),
            "possibly_unused_count": len(possibly_unused)
        },
        "definitely_unused": definitely_unused,
        "possibly_unused": possibly_unused,
        "note": "Verify before removal. Deletion must be executed through safe workflow."
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(find_unused_dependencies(target), indent=2))
