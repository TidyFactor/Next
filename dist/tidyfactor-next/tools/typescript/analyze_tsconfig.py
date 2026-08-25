#!/usr/bin/env python3
"""
analyze_tsconfig.py — Inspects tsconfig.json for compiler optimization settings, scope boundaries, and incremental builds.
"""

import os
import sys
import json
import re

def remove_comments(json_like_str):
    pattern = r"(\".*?\"|\'.*?\')|(/\*.*?\*/|//[^\r\n]*$)"
    regex = re.compile(pattern, re.MULTILINE | re.DOTALL)
    def _replacer(match):
        if match.group(2) is not None:
            return ""
        else:
            return match.group(1)
    return regex.sub(_replacer, json_like_str)

def analyze_tsconfig(project_root="."):
    root = os.path.abspath(project_root)
    tsconfig_path = os.path.join(root, "tsconfig.json")
    
    if not os.path.exists(tsconfig_path):
        return {"error": "tsconfig.json not found"}

    try:
        with open(tsconfig_path, "r", encoding="utf-8", errors="ignore") as f:
            raw = f.read()
            clean_json = remove_comments(raw)
            # Remove trailing commas
            clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
            ts_data = json.loads(clean_json)
    except Exception as e:
        return {"error": f"Failed to parse tsconfig.json: {str(e)}"}

    compiler_options = ts_data.get("compilerOptions", {})
    includes = ts_data.get("include", [])
    excludes = ts_data.get("exclude", [])

    incremental = compiler_options.get("incremental", False)
    ts_build_info = compiler_options.get("tsBuildInfoFile")
    allow_js = compiler_options.get("allowJs", False)
    check_js = compiler_options.get("checkJs", False)
    skip_lib_check = compiler_options.get("skipLibCheck", False)
    strict = compiler_options.get("strict", False)

    findings = []
    
    # 1. incremental build check
    if not incremental:
        findings.append({
            "category": "Performance",
            "setting": "compilerOptions.incremental",
            "status": "FALSE",
            "recommendation": "Enable 'incremental: true' to cache type check graph across tsc runs"
        })

    # 2. skipLibCheck
    if not skip_lib_check:
        findings.append({
            "category": "Performance",
            "setting": "compilerOptions.skipLibCheck",
            "status": "FALSE",
            "recommendation": "Enable 'skipLibCheck: true' to avoid re-checking external .d.ts files in node_modules"
        })

    # 3. broad include scope
    broad_includes = [inc for inc in includes if inc in ["**/*", "*", "."]]
    if broad_includes:
        findings.append({
            "category": "Scope Boundary",
            "setting": "include",
            "status": f"Broad scope: {broad_includes}",
            "recommendation": "Tighten include to explicit source dirs: ['src/**/*', 'app/**/*', 'components/**/*', 'next-env.d.ts']"
        })

    # 4. missing excludes
    missing_excludes = []
    recommended_excludes = ["node_modules", ".next", "dist", "build", "coverage"]
    for rec in recommended_excludes:
        if rec not in excludes:
            missing_excludes.append(rec)
            
    if missing_excludes:
        findings.append({
            "category": "Scope Boundary",
            "setting": "exclude",
            "status": f"Missing excludes: {missing_excludes}",
            "recommendation": f"Add {missing_excludes} to tsconfig.json exclude array"
        })

    return {
        "status": "ANALYSIS_COMPLETE",
        "configuration": {
            "incremental": incremental,
            "skipLibCheck": skip_lib_check,
            "strict": strict,
            "allowJs": allow_js,
            "include_count": len(includes),
            "exclude_count": len(excludes)
        },
        "findings": findings
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(analyze_tsconfig(target), indent=2))
