#!/usr/bin/env python3
"""
system_probe.py — Best-Effort Host Resource Prober.
Reads OS RAM, CPU cores, storage free space, and load across Windows/Linux/macOS.
Does NOT fabricate metrics if environment restrictions apply.
"""

import os
import sys
import json
import platform
import shutil

def probe_system():
    os_name = platform.system()
    cpu_count = os.cpu_count()
    
    # Storage
    total, used, free = shutil.disk_usage(".")
    storage_info = {
        "total_gb": round(total / (1024**3), 1),
        "free_gb": round(free / (1024**3), 1),
        "used_gb": round(used / (1024**3), 1),
        "percent_used": f"{round((used / total) * 100, 1)}%"
    }

    # RAM (best effort across platforms)
    ram_info = {"status": "NOT_MEASURABLE"}
    try:
        if os_name == "Windows":
            import ctypes
            class MEMORYSTATUSEX(ctypes.Structure):
                _fields_ = [
                    ("dwLength", ctypes.c_ulong),
                    ("dwMemoryLoad", ctypes.c_ulong),
                    ("ullTotalPhys", ctypes.c_ulonglong),
                    ("ullAvailPhys", ctypes.c_ulonglong),
                    ("ullTotalPageFile", ctypes.c_ulonglong),
                    ("ullAvailPageFile", ctypes.c_ulonglong),
                    ("ullTotalVirtual", ctypes.c_ulonglong),
                    ("ullAvailVirtual", ctypes.c_ulonglong),
                    ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
                ]
            stat = MEMORYSTATUSEX()
            stat.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(stat))
            ram_info = {
                "total_ram_gb": round(stat.ullTotalPhys / (1024**3), 1),
                "avail_ram_gb": round(stat.ullAvailPhys / (1024**3), 1),
                "memory_load_percent": f"{stat.dwMemoryLoad}%"
            }
        elif os_name == "Linux":
            with open("/proc/meminfo", "r") as f:
                mem_data = f.read()
            total_kb = int([line.split()[1] for line in mem_data.splitlines() if "MemTotal" in line][0])
            avail_kb = int([line.split()[1] for line in mem_data.splitlines() if "MemAvailable" in line][0])
            ram_info = {
                "total_ram_gb": round(total_kb / (1024**2), 1),
                "avail_ram_gb": round(avail_kb / (1024**2), 1),
                "memory_load_percent": f"{round(((total_kb - avail_kb) / total_kb) * 100, 1)}%"
            }
    except Exception:
        ram_info = {
            "status": "HOST_METRICS_UNAVAILABLE",
            "manual_command": "wmic os get TotalVisibleMemorySize (Windows) or free -h (Linux)"
        }

    return {
        "platform": {
            "os": os_name,
            "release": platform.release(),
            "python_version": platform.python_version(),
            "cpu_cores": cpu_count
        },
        "storage": storage_info,
        "memory": ram_info
    }

if __name__ == "__main__":
    print(json.dumps(probe_system(), indent=2))
