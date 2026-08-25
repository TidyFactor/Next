#!/usr/bin/env python3
"""
analyze_cache.py — Next.js Cache & Build Artifact Analyzer.
Inspects .next/cache subdirectories, computes Cache/Source ratios, and evaluates disk I/O cost.
"""

import os
import sys
import json

def get_dir_size(path):
    if not os.path.exists(path):
        return 0, 0
    total_size = 0
    total_files = 0
    for root, dirs, files in os.walk(path):
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
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024.0:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024.0
    return f"{bytes_val:.1f} TB"

def analyze_cache(project_root="."):
    root = os.path.abspath(project_root)
    next_dir = os.path.join(root, ".next")
    cache_dir = os.path.join(next_dir, "cache")
    
    if not os.path.exists(next_dir):
        return {"status": "NO_BUILD", "message": "No .next directory found. Build has not run yet."}

    # Inspect cache subdirectories
    sub_caches = {}
    if os.path.exists(cache_dir):
        for item in os.listdir(cache_dir):
            item_path = os.path.join(cache_dir, item)
            if os.path.isdir(item_path):
                sz, count = get_dir_size(item_path)
                sub_caches[item] = {
                    "bytes": sz,
                    "formatted": format_size(sz),
                    "files": count
                }

    total_cache_size, total_cache_files = get_dir_size(cache_dir)
    total_next_size, total_next_files = get_dir_size(next_dir)

    # Source code size
    source_size = 0
    for d in ["app", "src", "components", "lib", "pages"]:
        dp = os.path.join(root, d)
        if os.path.exists(dp):
            sz, _ = get_dir_size(dp)
            source_size += sz

    cache_to_source_ratio = (total_cache_size / max(source_size, 1)) if source_size > 0 else 0

    return {
        "status": "CACHE_FOUND" if os.path.exists(cache_dir) else "CACHE_EMPTY",
        "summary": {
            "total_next_size": format_size(total_next_size),
            "total_cache_size": format_size(total_cache_size),
            "cache_file_count": total_cache_files,
            "source_size": format_size(source_size),
            "cache_to_source_ratio": f"{cache_to_source_ratio:.2f}x"
        },
        "sub_caches": sub_caches,
        "assessment": {
            "is_cache_heavy": cache_to_source_ratio > 10.0,
            "recommendation": "Do NOT disable caching globally. If cache is stale, perform a single clean via 'rm -rf .next/cache'."
        }
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(analyze_cache(target), indent=2))
