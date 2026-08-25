#!/usr/bin/env python3
"""
scan_project.py — High-level Next.js Project & Environment Inspector.
Read-only metadata and filesystem analysis outputting structured JSON.
"""

import os
import sys
import json
import subprocess
import shutil

def get_dir_size(path, exclude_dirs=None):
    if not os.path.exists(path):
        return 0, 0
    total_size = 0
    total_files = 0
    exclude = set(exclude_dirs or [])
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in exclude]
        for f in files:
            fp = os.path.join(root, f)
            try:
                if not os.path.islink(fp):
                    total_size += os.path.getsize(fp)
                    total_files += 1
            except (OSError, PermissionError):
                pass
    return total_size, total_files

def format_size(bytes_val):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_val < 1024.0:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024.0
    return f"{bytes_val:.1f} PB"

def inspect_project(project_root="."):
    root = os.path.abspath(project_root)
    pkg_json_path = os.path.join(root, "package.json")
    
    pkg_data = {}
    if os.path.exists(pkg_json_path):
        try:
            with open(pkg_json_path, "r", encoding="utf-8") as f:
                pkg_data = json.load(f)
        except Exception:
            pass

    # Framework versions
    deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
    next_ver = deps.get("next", "not_found")
    react_ver = deps.get("react", "not_found")
    ts_ver = deps.get("typescript", "not_found")

    # Package manager & Lockfile
    pkg_manager = "unknown"
    lockfile = None
    if os.path.exists(os.path.join(root, "pnpm-lock.yaml")):
        pkg_manager = "pnpm"
        lockfile = "pnpm-lock.yaml"
    elif os.path.exists(os.path.join(root, "bun.lockb")) or os.path.exists(os.path.join(root, "bun.lock")):
        pkg_manager = "bun"
        lockfile = "bun.lockb" if os.path.exists(os.path.join(root, "bun.lockb")) else "bun.lock"
    elif os.path.exists(os.path.join(root, "yarn.lock")):
        pkg_manager = "yarn"
        lockfile = "yarn.lock"
    elif os.path.exists(os.path.join(root, "package-lock.json")):
        pkg_manager = "npm"
        lockfile = "package-lock.json"

    # Bundler detection
    bundler = "webpack (default)"
    scripts = pkg_data.get("scripts", {})
    if any("--turbo" in str(v) for v in scripts.values()):
        bundler = "turbopack"

    # Directory sizes
    node_modules_size, node_modules_files = get_dir_size(os.path.join(root, "node_modules"))
    next_size, next_files = get_dir_size(os.path.join(root, ".next"))
    cache_size, cache_files = get_dir_size(os.path.join(root, ".next", "cache"))
    
    # Source size (excluding node_modules, .next, .git)
    source_size, source_files = get_dir_size(root, exclude_dirs=["node_modules", ".next", ".git", ".turbo"])

    # Suspicious / media directories inside dev tree
    suspicious_dirs = []
    for check_dir in ["public", "uploads", "media", "videos", "exports", "backups", "generated"]:
        full_dir = os.path.join(root, check_dir)
        if os.path.exists(full_dir):
            sz, count = get_dir_size(full_dir)
            if count > 1000 or sz > 50 * 1024 * 1024:  # >1000 files or >50MB
                suspicious_dirs.append({
                    "path": check_dir,
                    "size_bytes": sz,
                    "size_formatted": format_size(sz),
                    "file_count": count,
                    "warning": "Large directory inside dev tree, possible watch overhead"
                })

    result = {
        "project": {
            "name": pkg_data.get("name", os.path.basename(root)),
            "path": root,
            "package_manager": pkg_manager,
            "lockfile": lockfile
        },
        "framework": {
            "next_version": next_ver,
            "react_version": react_ver,
            "typescript_version": ts_ver,
            "detected_bundler": bundler
        },
        "sizes": {
            "source": {
                "bytes": source_size,
                "formatted": format_size(source_size),
                "files": source_files
            },
            "node_modules": {
                "bytes": node_modules_size,
                "formatted": format_size(node_modules_size),
                "files": node_modules_files
            },
            ".next": {
                "bytes": next_size,
                "formatted": format_size(next_size),
                "files": next_files
            },
            ".next_cache": {
                "bytes": cache_size,
                "formatted": format_size(cache_size),
                "files": cache_files
            }
        },
        "ratios": {
            "cache_to_source": f"{(cache_size / max(source_size, 1)):.2f}x",
            "node_modules_to_source": f"{(node_modules_size / max(source_size, 1)):.2f}x"
        },
        "suspicious_directories": suspicious_dirs
    }
    return result

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    res = inspect_project(target)
    print(json.dumps(res, indent=2))
