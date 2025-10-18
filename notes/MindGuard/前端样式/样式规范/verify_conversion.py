#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证px到rpx转换结果并生成报告
"""

import os
import re
from pathlib import Path

def check_px_conversion(directory):
    """检查目录中所有md文件的px转换情况"""
    files = list(Path(directory).glob("*.md"))
    files = [f for f in files if f.name not in ["README.md", "批量覆盖报告.md"]]

    conversion_report = []

    for file_path in files:
        print(f"\n检查文件: {file_path.name}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找所有px单位（不包括rpx）
        px_patterns = re.findall(r'\b\d+(?:\.\d+)?px\b', content)
        px_patterns = [p for p in px_patterns if not p.startswith('r')]  # 排除rpx

        # 查找所有rpx单位
        rpx_patterns = re.findall(r'\b\d+(?:\.\d+)?rpx\b', content)

        # 统计信息
        file_info = {
            'filename': file_path.name,
            'px_count': len(px_patterns),
            'rpx_count': len(rpx_patterns),
            'px_instances': px_patterns
        }

        conversion_report.append(file_info)

        if px_patterns:
            print(f"  发现未转换的px单位: {px_patterns}")
        else:
            print(f"  [OK] 所有单位已转换为rpx")
        print(f"  rpx单位数量: {len(rpx_patterns)}")

    return conversion_report

def generate_report(conversion_report):
    """生成转换报告"""
    print("\n" + "="*60)
    print("PX到RPX转换验证报告")
    print("="*60)

    total_files = len(conversion_report)
    fully_converted = sum(1 for report in conversion_report if report['px_count'] == 0)

    print(f"\n转换统计:")
    print(f"  总文件数: {total_files}")
    print(f"  完全转换: {fully_converted}")
    print(f"  转换率: {fully_converted/total_files*100:.1f}%")

    print(f"\n详细情况:")
    for report in conversion_report:
        status = "[完全转换]" if report['px_count'] == 0 else f"[未转换: {report['px_count']}个]"
        print(f"  {report['filename']}: {status}")
        if report['px_instances']:
            print(f"    未转换的px单位: {report['px_instances']}")

    print(f"\n总结:")
    if fully_converted == total_files:
        print("  [成功] 所有文件已成功完成px到rpx的转换！")
    else:
        print(f"  [注意] 仍有 {total_files - fully_converted} 个文件需要手动检查")

if __name__ == "__main__":
    # 设置目录路径
    directory = "D:\\Code\\MindGuard\\docs\\前端样式\\样式规范"

    # 执行检查
    conversion_report = check_px_conversion(directory)

    # 生成报告
    generate_report(conversion_report)