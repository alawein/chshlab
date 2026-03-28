#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_ROOT = ROOT / "output" / "playwright"
BREAKPOINTS = [
    {"label": "mobile", "width": 390, "height": 844},
    {"label": "tablet", "width": 768, "height": 1024},
    {"label": "laptop", "width": 1024, "height": 900},
    {"label": "desktop", "width": 1440, "height": 1024},
]
ROUTES = [
    {"label": "home", "path": "/"},
    {"label": "home-dashboard", "path": "/#lab-dashboard"},
    {"label": "paper", "path": "/paper.html"},
    {"label": "not-found", "path": "/404.html"},
]


def wait_for_http(url: str, timeout: float = 10.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urlopen(url):
                return
        except URLError:
            time.sleep(0.2)
    raise RuntimeError(f"Timed out waiting for {url}")


def is_port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.25)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def run_command(args: list[str], cwd: Path | None = None) -> None:
    subprocess.run(args, cwd=str(cwd) if cwd else None, check=True)


def sanitize_session_label(value: str) -> str:
    return "".join(char if char.isalnum() or char in {"-", "_"} else "-" for char in value)


def main() -> None:
    parser = argparse.ArgumentParser(description="Capture a breakpoint matrix for CHSH Lab.")
    parser.add_argument("--base-url", default="http://127.0.0.1:4173", help="Base URL to audit.")
    parser.add_argument("--port", type=int, default=4173, help="Port for the local static server.")
    parser.add_argument("--browser", default="msedge", help="Playwright browser/channel to use.")
    args = parser.parse_args()

    npx_executable = shutil.which("npx.cmd") or shutil.which("npx")
    if npx_executable is None:
        raise RuntimeError("npx is required to run the visual audit.")

    timestamp = time.strftime("%Y%m%d-%H%M%S")
    session = sanitize_session_label(f"chshlab-audit-{timestamp}")
    output_dir = OUTPUT_ROOT / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)

    server_process = None
    server_started_here = False
    if not is_port_open(args.port):
        server_stdout = (output_dir / "http.log").open("w", encoding="utf-8")
        server_stderr = (output_dir / "http.err.log").open("w", encoding="utf-8")
        server_process = subprocess.Popen(
            [sys.executable, "-m", "http.server", str(args.port)],
            cwd=ROOT,
            stdout=server_stdout,
            stderr=server_stderr,
        )
        server_started_here = True

    try:
        wait_for_http(args.base_url)

        base_cli = [
            npx_executable,
            "--yes",
            "--package",
            "@playwright/cli",
            "playwright-cli",
            f"-s={session}",
        ]

        run_command(base_cli + ["open", args.base_url, "--browser", args.browser], cwd=ROOT)

        manifest = {
            "baseUrl": args.base_url,
            "breakpoints": BREAKPOINTS,
            "routes": ROUTES,
            "captures": [],
        }

        for breakpoint in BREAKPOINTS:
            run_command(
                base_cli + ["resize", str(breakpoint["width"]), str(breakpoint["height"])],
                cwd=ROOT,
            )

            for route in ROUTES:
                url = f"{args.base_url.rstrip('/')}{route['path']}"
                filename = f"{route['label']}--{breakpoint['label']}.png"
                destination = output_dir / filename

                run_command(base_cli + ["goto", url], cwd=ROOT)
                run_command(
                    base_cli + [
                        "screenshot",
                        "--full-page",
                        "--filename",
                        str(destination),
                    ],
                    cwd=ROOT,
                )

                manifest["captures"].append({
                    "route": route["path"],
                    "label": route["label"],
                    "breakpoint": breakpoint["label"],
                    "width": breakpoint["width"],
                    "height": breakpoint["height"],
                    "file": destination.name,
                })

        (output_dir / "manifest.json").write_text(
            json.dumps(manifest, indent=2),
            encoding="utf-8",
        )
    finally:
        subprocess.run(
            [
                npx_executable,
                "--yes",
                "--package",
                "@playwright/cli",
                "playwright-cli",
                f"-s={session}",
                "close",
            ],
            cwd=ROOT,
            check=False,
        )

        if server_process is not None and server_started_here:
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()


if __name__ == "__main__":
    main()
