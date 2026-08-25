#!/usr/bin/env python3
"""
explain_scope.py — TypeScript Scope & File Inclusion Explainer.
Executes or parses `tsc --explainFiles` to isolate why unintended files entered the type graph.
"""

import os
import sys
import json
import subprocess

def explain_typescript_scope(project_root="."):
    root = os.path.abspath(project_root)
    
    cmd = ["npx", "tsc", "--explainFiles", "--noEmit"]
    try:
        proc = subprocess.run(
            cmd,
            cwd=root,
            capture_output=True,
            text=True,
            shell=True,
            timeout=60
        )
        output = proc.stdout + proc.stderr
        
        lines = output.splitlines()
        included_files = []
        current_file = None
        current_reasons = []

        for line in lines:
            if line and not line.startswith(" ") and not line.startswith("\t"):
                if current_file:
                    included_files.append({"file": current_file, "reasons": current_reasons})
                current_file = line.strip()
                current_reasons = []
            elif current_file and line.strip():
                current_reasons.append(line.strip())
                
        if current_file:
            included_files.append({"file": current_file, "reasons": current_reasons})

        # Find suspicious files in scope (e.g., .next/, generated/, test files, large JSON)
        suspicious_scope = []
        for entry in included_files:
            f = entry["file"]
            if any(s in f for s in [".next", "node_modules", "generated", "temp", "backups", ".json"]):
                suspicious_scope.append(entry)

        return {
            "status": "SUCCESS",
            "total_files_analyzed": len(included_files),
            "suspicious_files_in_scope_count": len(suspicious_scope),
            "suspicious_files_sample": suspicious_scope[:10],
            "raw_summary": f"Analyzed {len(included_files)} TypeScript files."
        }

    except Exception as e:
        return {
            "status": "COMMAND_UNAVAILABLE",
            "error": str(e),
            "manual_command": "npx tsc --explainFiles --noEmit"
        }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(explain_typescript_scope(target), indent=2))
