#!/usr/bin/env python3
"""
check_change_scope.py — Change Scope & SaaS Security Boundary Validator.
Inspects git diff / modified files and classifies them as SAFE, REVIEW, or FORBIDDEN.
Blocks performance optimizations that accidentally touch database, RLS, or auth boundaries.
"""

import os
import sys
import json
import subprocess

FORBIDDEN_PATTERNS = [
    "supabase/migrations",
    "migrations/",
    "schema.sql",
    "rls",
    "auth",
    "session",
    "middleware.ts",
    "tenant",
]

SAFE_PATTERNS = [
    "tsconfig.json",
    ".gitignore",
    "README.md",
    "README.ar.md",
    "ARCHITECTURE.md",
    ".eslintignore",
]

REVIEW_PATTERNS = [
    "next.config",
    "package.json",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "components/",
    "app/",
    "src/",
]

def check_modified_files(project_root="."):
    root = os.path.abspath(project_root)
    
    # Get git status / diff
    modified_files = []
    try:
        proc = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=root,
            capture_output=True,
            text=True,
            shell=True
        )
        for line in proc.stdout.splitlines():
            if len(line) > 3:
                modified_files.append(line[3:].strip())
    except Exception as e:
        return {"status": "GIT_ERROR", "error": str(e)}

    forbidden_files = []
    review_files = []
    safe_files = []

    for f in modified_files:
        f_lower = f.lower()
        if any(p in f_lower for p in FORBIDDEN_PATTERNS):
            forbidden_files.append(f)
        elif any(p in f_lower for p in SAFE_PATTERNS):
            safe_files.append(f)
        else:
            review_files.append(f)

    is_blocked = len(forbidden_files) > 0

    return {
        "status": "BLOCKED" if is_blocked else "ALLOWED",
        "total_files_modified": len(modified_files),
        "classification": {
            "safe_files": safe_files,
            "review_files": review_files,
            "forbidden_files": forbidden_files
        },
        "verdict": "BLOCKED: Changes touch protected SaaS Security / RLS / Auth boundaries!" if is_blocked else "PASSED: Changes are within safe performance scope."
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(check_modified_files(target), indent=2))
