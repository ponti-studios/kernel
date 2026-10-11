#!/usr/bin/env python3
"""Calculate WCAG contrast for two #RRGGBB or #RGB colors."""

from __future__ import annotations

import argparse
import re


def parse_color(value: str) -> tuple[int, int, int]:
    match = re.fullmatch(r"#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", value.strip())
    if not match:
        raise ValueError(f"unsupported color: {value}")
    value = match.group(1)
    if len(value) == 3:
        value = "".join(char * 2 for char in value)
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def channel(value: int) -> float:
    value /= 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def luminance(rgb: tuple[int, int, int]) -> float:
    red, green, blue = (channel(value) for value in rgb)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def contrast(first: str, second: str) -> float:
    values = sorted((luminance(parse_color(first)), luminance(parse_color(second))))
    return (values[1] + 0.05) / (values[0] + 0.05)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("foreground")
    parser.add_argument("background")
    args = parser.parse_args()
    print(f"{contrast(args.foreground, args.background):.2f}:1")
