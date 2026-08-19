#!/usr/bin/env python3
"""
run.py — Multi-Run Benchmark Engine with Statistical Noise Control.
Measures execution time over N runs, calculates median, and tests variance against the 20% noise threshold.
"""

import os
import sys
import json
import time
import subprocess
import shutil
import argparse

def run_benchmark(command, runs=3, is_cold=False, project_root="."):
    root = os.path.abspath(project_root)
    timings = []
    
    cache_path = os.path.join(root, ".next", "cache")

    for i in range(1, runs + 1):
        if is_cold and os.path.exists(cache_path):
            shutil.rmtree(cache_path, ignore_errors=True)

        start_time = time.perf_counter()
        try:
            proc = subprocess.run(
                command,
                cwd=root,
                shell=True,
                capture_output=True,
                text=True
            )
            duration = time.perf_counter() - start_time
            if proc.returncode == 0:
                timings.append(round(duration, 3))
            else:
                return {
                    "status": "COMMAND_FAILED",
                    "command": command,
                    "return_code": proc.returncode,
                    "stderr": proc.stderr.strip()[:500]
                }
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

    timings.sort()
    n = len(timings)
    median = timings[n // 2] if n % 2 == 1 else round((timings[n // 2 - 1] + timings[n // 2]) / 2.0, 3)
    variance = round(max(timings) - min(timings), 3)
    noise_ratio = round((variance / median) * 100, 1) if median > 0 else 0

    return {
        "command": command,
        "mode": "COLD" if is_cold else "WARM",
        "runs_count": runs,
        "runs": timings,
        "median_seconds": median,
        "variance_seconds": variance,
        "noise_percentage": f"{noise_ratio}%",
        "noise_acceptable": noise_ratio <= 20.0,
        "warning": "Noise exceeds 20% threshold; pause background processes and re-run." if noise_ratio > 20.0 else None
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TidyFactor Next.js Benchmark Engine")
    parser.add_argument("--command", required=True, help="Command to benchmark")
    parser.add_argument("--runs", type=int, default=3, help="Number of benchmark runs (default: 3)")
    parser.add_argument("--cold", action="store_true", help="Clear .next/cache before each run")
    parser.add_argument("--root", default=".", help="Project root directory")
    
    args = parser.parse_args()
    result = run_benchmark(args.command, runs=args.runs, is_cold=args.cold, project_root=args.root)
    print(json.dumps(result, indent=2))
