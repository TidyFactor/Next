#!/usr/bin/env python3
"""
compare.py — BEFORE / AFTER / DELTA Benchmark Comparator.
Calculates exact percentage and numeric improvement differences between baseline and post-optimization runs.
"""

import sys
import json

def compare_metrics(before_data, after_data):
    comparison = []
    
    for metric, before_val in before_data.items():
        if metric in after_data:
            after_val = after_data[metric]
            
            # Handle numeric floats / ints
            if isinstance(before_val, (int, float)) and isinstance(after_val, (int, float)):
                diff = round(after_val - before_val, 3)
                pct = round(((after_val - before_val) / before_val) * 100, 2) if before_val != 0 else 0
                comparison.append({
                    "metric": metric,
                    "before": before_val,
                    "after": after_val,
                    "delta": diff,
                    "percentage": f"{pct:+.1f}%",
                    "improved": diff < 0
                })
            else:
                comparison.append({
                    "metric": metric,
                    "before": str(before_val),
                    "after": str(after_val),
                    "delta": "N/A"
                })

    return {
        "status": "COMPARISON_COMPLETE",
        "results": comparison
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python compare.py <baseline.json> <after.json>")
        sys.exit(1)
        
    with open(sys.argv[1], "r", encoding="utf-8") as f1, open(sys.argv[2], "r", encoding="utf-8") as f2:
        b_data = json.load(f1)
        a_data = json.load(f2)
        
    print(json.dumps(compare_metrics(b_data, a_data), indent=2))
