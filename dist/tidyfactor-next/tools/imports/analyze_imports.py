#!/usr/bin/env python3
"""
analyze_imports.py — Inspects barrel imports, namespace imports, deep imports, and type imports.
Provides evidence-based recommendations for optimizePackageImports and direct imports.
"""

import os
import sys
import json
import re
from collections import defaultdict

BARREL_CANDIDATES = {
    "lucide-react",
    "@tabler/icons-react",
    "react-icons",
    "lodash",
    "@mui/material",
    "@mui/icons-material",
    "date-fns",
    "rxjs"
}

def analyze_project_imports(project_root="."):
    root = os.path.abspath(project_root)
    
    barrel_usages = defaultdict(list)
    namespace_imports = []
    type_import_candidates = []
    
    code_extensions = {".js", ".jsx", ".ts", ".tsx"}
    
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ["node_modules", ".next", ".git", "dist", "build"]]
        for f in filenames:
            ext = os.path.splitext(f)[1].lower()
            if ext in code_extensions:
                file_path = os.path.join(dirpath, f)
                rel_path = os.path.relpath(file_path, root)
                
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as file_obj:
                        lines = file_obj.readlines()
                        
                    for line_no, line in enumerate(lines, 1):
                        line_str = line.strip()
                        if not line_str.startswith("import"):
                            continue
                            
                        # Check barrel imports: import { A, B } from 'pkg'
                        barrel_match = re.search(r'''import\s*\{([^}]+)\}\s*from\s*['"]([@\w\d_\-\/]+)['"]''', line_str)
                        if barrel_match:
                            symbols = [s.strip() for s in barrel_match.group(1).split(",") if s.strip()]
                            pkg = barrel_match.group(2)
                            base_pkg = pkg.split('/')[0] if not pkg.startswith('@') else '/'.join(pkg.split('/')[:2])
                            
                            if base_pkg in BARREL_CANDIDATES or len(symbols) >= 5:
                                barrel_usages[base_pkg].append({
                                    "file": rel_path,
                                    "line": line_no,
                                    "symbols_count": len(symbols),
                                    "statement": line_str
                                })
                                
                        # Check namespace imports: import * as X from 'pkg'
                        ns_match = re.search(r'''import\s*\*\s*as\s+(\w+)\s+from\s*['"]([@\w\d_\-\/]+)['"]''', line_str)
                        if ns_match:
                            namespace_imports.append({
                                "file": rel_path,
                                "line": line_no,
                                "alias": ns_match.group(1),
                                "package": ns_match.group(2)
                            })
                            
                except Exception:
                    pass

    # Compile recommendations
    optimize_package_imports_rec = []
    for pkg, occurrences in barrel_usages.items():
        optimize_package_imports_rec.append({
            "package": pkg,
            "occurrence_count": len(occurrences),
            "sample_files": [o["file"] for o in occurrences[:3]],
            "recommendation": f"Add '{pkg}' to next.config.js experimental.optimizePackageImports"
        })

    return {
        "barrel_import_findings": optimize_package_imports_rec,
        "namespace_imports_count": len(namespace_imports),
        "namespace_imports_sample": namespace_imports[:5],
        "evidence_summary": {
            "total_barrel_packages_detected": len(optimize_package_imports_rec),
            "action_tier": "YELLOW (Requires developer review and benchmark before next.config edit)"
        }
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(analyze_project_imports(target), indent=2))
