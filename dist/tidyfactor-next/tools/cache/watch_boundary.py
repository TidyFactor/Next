#!/usr/bin/env python3
"""
watch_boundary.py — File Watcher Boundary & Media Overflow Detector.
Identifies large directories (media, uploads, generated assets) inside the development tree
that trigger excessive filesystem watch overhead.
"""

import os
import sys
import json

WATCH_RISK_NAMES = {
    "uploads", "videos", "media", "images", "generated", "backups",
    "logs", "exports", "ai_output", "temp", "cache", "coverage", "recordings"
}

def get_dir_stats(path):
    total_size = 0
    total_files = 0
    large_files = []
    
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                if not os.path.islink(fp):
                    sz = os.path.getsize(fp)
                    total_size += sz
                    total_files += 1
                    if sz > 10 * 1024 * 1024:  # >10MB
                        large_files.append({"file": os.path.relpath(fp, path), "size_mb": round(sz / (1024 * 1024), 2)})
            except (OSError, PermissionError):
                pass
    return total_size, total_files, large_files

def format_size(bytes_val):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024.0:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024.0
    return f"{bytes_val:.1f} TB"

def scan_watch_boundaries(project_root="."):
    root = os.path.abspath(project_root)
    
    flagged_directories = []
    
    # Inspect top-level and public sub-directories
    for item in os.listdir(root):
        if item in ["node_modules", ".next", ".git", ".turbo"]:
            continue
        item_path = os.path.join(root, item)
        if os.path.isdir(item_path):
            sz, count, large_files = get_dir_stats(item_path)
            
            # Risk triggers: >500 files or >25MB or matching risk names
            is_risk_name = item.lower() in WATCH_RISK_NAMES
            is_heavy = count > 500 or sz > 25 * 1024 * 1024
            
            if is_risk_name or is_heavy:
                flagged_directories.append({
                    "directory": item,
                    "file_count": count,
                    "total_size": format_size(sz),
                    "large_files_detected": len(large_files),
                    "risk_level": "CRITICAL" if count > 2000 or sz > 100 * 1024 * 1024 else "MEDIUM",
                    "recommendation": f"Add '{item}/' to .gitignore or relocate outside active watched source directory"
                })

    return {
        "summary": {
            "total_flagged_directories": len(flagged_directories),
            "watch_overhead_detected": any(d["risk_level"] == "CRITICAL" for d in flagged_directories)
        },
        "flagged_directories": flagged_directories
    }

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(json.dumps(scan_watch_boundaries(target), indent=2))
