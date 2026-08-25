#!/usr/bin/env python3
"""
profile.py — TypeScript Extended Diagnostics Profiler.
Runs `tsc --extendedDiagnostics --noEmit` to measure exact typecheck timings, memory, types, and instantiations.
"""

import os
import sys
import json
import subprocess
import re

def profile_typescript(project_root="."):
    root = os.path.abspath(project_root)
    
    cmd = ["npx", "tsc", "--extendedDiagnostics", "--noEmit"]
    try:
        proc = subprocess.run(
            cmd,
            cwd=root,
            capture_output=True,
            text=True,
            shell=True,
            timeout=90
        )
        output = proc.stdout + proc.stderr

        metrics = {}
        for line in output.splitlines():
            if ":" in line:
                parts = line.split(":", 1)
                k = parts[0].strip()
                v = parts[1].strip()
                if any(m in k.lower() for m in ["files", "lines", "identifiers", "symbols", "types", "instantiations", "memory", "time"]):
                    metrics[k] = v

        return {
            "status": "SUCCESS",
            "diagnostics": metrics,
            "raw_output": output.strip() if not metrics else None
        }

    except Exception as e:
        return {
            "status": "COMMAND_UNAVAILABLE",
            "error": str(e),
            "manual_command": "npx tsc --extendedDiagnostics --noEmit"
        }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(profile_typescript(target), indent=2))
