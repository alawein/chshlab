#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials"

BLOCKS = {
    "SHARED_HEAD": (PARTIALS / "head-shared.html").read_text(encoding="utf-8").strip(),
    "SHARED_CORE_STYLES": (PARTIALS / "styles-core.html").read_text(encoding="utf-8").strip(),
}

TARGETS = [
    ROOT / "index.html",
    ROOT / "paper.html",
    ROOT / "404.html",
]


def replace_block(content: str, block_name: str, replacement: str, path: Path) -> str:
    pattern = re.compile(
        rf"(?P<indent>[ \t]*)<!-- {block_name}:START -->\r?\n.*?\r?\n(?P=indent)<!-- {block_name}:END -->",
        re.DOTALL,
    )

    match = pattern.search(content)
    if not match:
        raise RuntimeError(f"Missing block markers for {block_name} in {path}")

    indent = match.group("indent")
    indented = "\n".join(
        f"{indent}{line}" if line else ""
        for line in replacement.splitlines()
    )
    replacement_block = (
        f"{indent}<!-- {block_name}:START -->\n"
        f"{indented}\n"
        f"{indent}<!-- {block_name}:END -->"
    )
    return pattern.sub(replacement_block, content, count=1)


def main() -> None:
    for path in TARGETS:
        content = path.read_text(encoding="utf-8")
        for block_name, replacement in BLOCKS.items():
            content = replace_block(content, block_name, replacement, path)
        path.write_text(content, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
