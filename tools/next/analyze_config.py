#!/usr/bin/env python3
"""
analyze_config.py — Next.js Configuration Inspector.
Inspects next.config.js / next.config.mjs / next.config.ts for experimental flags,
bundler settings, transpilePackages, and optimizePackageImports.
"""

import os
import sys
import json
import re

def analyze_next_config(project_root="."):
    root = os.path.abspath(project_root)
    
    config_file = None
    for name in ["next.config.ts", "next.config.mjs", "next.config.js"]:
        full = os.path.join(root, name)
        if os.path.exists(full):
            config_file = full
            break
            
    if not config_file:
        return {"status": "default", "message": "No custom next.config found; Next.js defaults active"}

    with open(config_file, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    rel_name = os.path.basename(config_file)
    
    # Flags detection
    has_optimize_package_imports = "optimizePackageImports" in content
    has_server_external_packages = "serverExternalPackages" in content or "serverComponentsExternalPackages" in content
    has_turbo_config = "turbopack" in content.lower()
    has_webpack_customization = "webpack:" in content or "webpack(" in content
    has_transpile_packages = "transpilePackages" in content
    has_standalone_output = "output: 'standalone'" in content or 'output: "standalone"' in content
    has_bundle_analyzer = "@next/bundle-analyzer" in content

    findings = []
    if has_webpack_customization:
        findings.append({
            "setting": "custom webpack config",
            "risk": "MEDIUM",
            "note": "Custom webpack loader/plugin may prevent automatic Turbopack adoption"
        })

    if not has_optimize_package_imports:
        findings.append({
            "setting": "optimizePackageImports",
            "status": "MISSING",
            "opportunity": "Can reduce client bundle and compile time for barrel packages like lucide-react"
        })

    if has_bundle_analyzer:
        findings.append({
            "setting": "@next/bundle-analyzer",
            "status": "PRESENT",
            "note": "Bundle analyzer configured for build diagnostic output"
        })

    return {
        "config_file": rel_name,
        "features_detected": {
            "optimizePackageImports": has_optimize_package_imports,
            "serverExternalPackages": has_server_external_packages,
            "transpilePackages": has_transpile_packages,
            "turbopack_config": has_turbo_config,
            "custom_webpack": has_webpack_customization,
            "standalone_output": has_standalone_output
        },
        "findings": findings
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(analyze_next_config(target), indent=2))
