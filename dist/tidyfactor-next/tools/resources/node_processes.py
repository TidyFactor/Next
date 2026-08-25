#!/usr/bin/env python3
"""
node_processes.py — Node & Toolchain Process Inspector.
Discovers active node, next, tsserver, and eslint background processes and reports memory footprint.
"""

import os
import sys
import json
import subprocess
import platform

def inspect_node_processes():
    os_name = platform.system()
    processes = []
    
    try:
        if os_name == "Windows":
            cmd = "tasklist /FI \"IMAGENAME eq node.exe\" /FO CSV /NH"
            proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            for line in proc.stdout.splitlines():
                if "node.exe" in line:
                    parts = [p.strip('"') for p in line.split('","')]
                    if len(parts) >= 5:
                        processes.append({
                            "name": parts[0],
                            "pid": parts[1],
                            "session": parts[2],
                            "memory_working_set": parts[4]
                        })
        elif os_name in ["Linux", "Darwin"]:
            cmd = "ps aux | grep -E 'node|next|tsserver' | grep -v grep"
            proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            for line in proc.stdout.splitlines():
                parts = line.split(None, 10)
                if len(parts) >= 11:
                    processes.append({
                        "user": parts[0],
                        "pid": parts[1],
                        "cpu_percent": parts[2],
                        "mem_percent": parts[3],
                        "command": parts[10][:80]
                    })
    except Exception as e:
        return {"status": "UNAVAILABLE", "error": str(e)}

    return {
        "status": "SUCCESS",
        "total_node_instances": len(processes),
        "processes": processes,
        "warning": "Multiple (>2) Node processes running concurrently; check for orphaned dev servers or background workers." if len(processes) > 2 else None
    }

if __name__ == "__main__":
    print(json.dumps(inspect_node_processes(), indent=2))
