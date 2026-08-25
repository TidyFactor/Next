#!/usr/bin/env python3
"""
scan_client_boundary.py — Inspects "use client" boundaries and detects server package leaks into client components.
"""

import os
import sys
import json
import re

SERVER_ONLY_PACKAGES = {
    "@supabase/supabase-js": "Direct Supabase client in client component — verify anon key only; service_role is FORBIDDEN",
    "prisma": "Database ORM must never be imported in client components",
    "@prisma/client": "Database ORM must never be imported in client components",
    "drizzle-orm": "Database ORM must never be imported in client components",
    "pg": "Raw database driver must never be imported in client components",
    "mysql2": "Raw database driver must never be imported in client components",
    "jsonwebtoken": "JWT signing library is server-only",
    "bcrypt": "Hashing library is server-only",
    "bcryptjs": "Hashing library is server-only",
    "stripe": "Stripe secret backend SDK must never be in client components",
    "openai": "OpenAI server SDK should not expose API keys in client components",
    "nodemailer": "Email server library is server-only",
}

def scan_client_boundaries(project_root="."):
    root = os.path.abspath(project_root)
    
    client_files = []
    server_package_leaks = []
    
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
                        content = file_obj.read()
                        
                    # Check "use client" directive
                    is_client = re.search(r'''^['"]use client['"]''', content.strip()) is not None
                    
                    if is_client:
                        client_files.append(rel_path)
                        
                        # Check for server-only package imports in this client file
                        for pkg, warning in SERVER_ONLY_PACKAGES.items():
                            if re.search(rf'''(?:import|from|require)\s*\(?['"]{re.escape(pkg)}['"]''', content):
                                server_package_leaks.append({
                                    "client_file": rel_path,
                                    "leaked_package": pkg,
                                    "severity": "CRITICAL",
                                    "warning": warning
                                })
                                
                except Exception:
                    pass

    return {
        "summary": {
            "total_client_components_detected": len(client_files),
            "server_leaks_detected": len(server_package_leaks)
        },
        "critical_server_leaks": server_package_leaks,
        "client_component_samples": client_files[:10],
        "verdict": "CRITICAL SECURITY / ARCHITECTURE DEFECT" if server_package_leaks else "CLEAN — Zero server package leaks detected"
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(scan_client_boundaries(target), indent=2))
