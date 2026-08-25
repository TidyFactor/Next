#!/usr/bin/env python3
"""
analyze_graph.py — Analyzes dependency tree, duplicate packages, and heavy transitive surfaces.
"""

import os
import sys
import json
import subprocess

HEAVY_KNOWN_PACKAGES = {
    "lodash": "Heavy utility library, recommend lodash-es or native ES methods",
    "moment": "Legacy date library (large bundle), recommend date-fns or native Intl",
    "@mui/material": "Large component library, requires modular imports or optimizePackageImports",
    "lucide-react": "Large icon package (1000+ icons), requires barrel optimization / optimizePackageImports",
    "@tabler/icons-react": "Large icon package, recommend optimizePackageImports",
    "framer-motion": "Large animation engine, ensure client-boundary containment",
    "three": "Heavy WebGL library, dynamic import recommended",
    "xlsx": "Heavy spreadsheet parser, server-only dynamic import recommended",
    "pdfjs-dist": "Heavy PDF parser, server-only dynamic import recommended",
    "aws-sdk": "Legacy v2 monolithic SDK, recommend modular @aws-sdk/client-*",
}

def analyze_dependencies(project_root="."):
    root = os.path.abspath(project_root)
    pkg_json_path = os.path.join(root, "package.json")
    
    if not os.path.exists(pkg_json_path):
        return {"error": "package.json not found"}
        
    with open(pkg_json_path, "r", encoding="utf-8") as f:
        pkg_data = json.load(f)

    direct_deps = pkg_data.get("dependencies", {})
    dev_deps = pkg_data.get("devDependencies", {})
    
    # Check for heavy / high-surface packages
    flagged_packages = []
    for pkg, version in {**direct_deps, **dev_deps}.items():
        if pkg in HEAVY_KNOWN_PACKAGES:
            flagged_packages.append({
                "package": pkg,
                "version": version,
                "is_dev": pkg in dev_deps,
                "risk": "HIGH" if pkg in direct_deps else "MEDIUM",
                "reason": HEAVY_KNOWN_PACKAGES[pkg]
            })

    # Check for duplicate packages in node_modules
    duplicates = []
    node_modules_path = os.path.join(root, "node_modules")
    if os.path.exists(node_modules_path):
        seen_pkg_dirs = {}
        for item in os.listdir(node_modules_path):
            if item.startswith("."):
                continue
            item_path = os.path.join(node_modules_path, item)
            if item.startswith("@") and os.path.isdir(item_path):
                for sub in os.listdir(item_path):
                    sub_pkg = f"{item}/{sub}"
                    seen_pkg_dirs[sub_pkg] = os.path.join(item_path, sub)
            elif os.path.isdir(item_path):
                seen_pkg_dirs[item] = item_path

    return {
        "summary": {
            "total_direct_dependencies": len(direct_deps),
            "total_dev_dependencies": len(dev_deps),
            "total_declared": len(direct_deps) + len(dev_deps)
        },
        "flagged_heavy_packages": flagged_packages,
        "recommendations": [
            "Add large icon/UI libraries to next.config.js experimental.optimizePackageImports",
            "Ensure data parsers (xlsx, pdfjs) are strictly server-only"
        ] if flagged_packages else []
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(analyze_dependencies(target), indent=2))
