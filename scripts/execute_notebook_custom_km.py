import argparse
import collections
import json
import os
import sys
import textwrap
from pathlib import Path
from uuid import uuid4

import nbformat
from nbclient import NotebookClient
from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager


KERNEL_NAME = "python-current-clean"


def write_launcher(runtime_dir: Path) -> Path:
    launcher_path = runtime_dir / "python_kernel_launcher.py"
    launcher_code = textwrap.dedent(
        """
        import collections
        import platform

        Uname = collections.namedtuple(
            "uname_result",
            "system node release version machine processor",
        )

        platform.system = lambda *args, **kwargs: "Windows"
        platform.win32_ver = lambda *args, **kwargs: ("", "", "", "")
        platform.uname = lambda *args, **kwargs: Uname(
            "Windows", "", "", "", "", ""
        )
        platform.platform = lambda *args, **kwargs: "Windows"

        from ipykernel.kernelapp import launch_new_instance

        launch_new_instance()
        """
    ).strip() + "\n"
    launcher_path.write_text(launcher_code, encoding="utf-8")
    return launcher_path


def write_kernel_spec(runtime_dir: Path, launcher_path: Path) -> Path:
    kernel_root = runtime_dir / "kernels" / KERNEL_NAME
    kernel_root.mkdir(parents=True, exist_ok=True)
    kernel_json = {
        "argv": [sys.executable, str(launcher_path), "-f", "{connection_file}"],
        "display_name": f"Python ({KERNEL_NAME})",
        "language": "python",
    }
    (kernel_root / "kernel.json").write_text(
        json.dumps(kernel_json, indent=2),
        encoding="utf-8",
    )
    return runtime_dir / "kernels"


def execute_notebook(input_path: Path, output_path: Path, runtime_dir: Path, timeout: int) -> None:
    runtime_dir.mkdir(parents=True, exist_ok=True)
    launcher_path = write_launcher(runtime_dir)
    kernel_dirs = write_kernel_spec(runtime_dir, launcher_path)

    with input_path.open("r", encoding="utf-8") as fh:
        notebook_data = json.load(fh)

    for cell in notebook_data.get("cells", []):
        cell.setdefault("id", uuid4().hex)
        if isinstance(cell.get("source"), list):
            cell["source"] = "".join(cell["source"])

    notebook = nbformat.from_dict(notebook_data)

    notebook.metadata["kernelspec"] = {
        "display_name": f"Python ({KERNEL_NAME})",
        "language": "python",
        "name": KERNEL_NAME,
    }

    ksm = KernelSpecManager(
        kernel_dirs=[str(kernel_dirs)],
        ensure_native_kernel=False,
    )
    km = KernelManager(
        kernel_name=KERNEL_NAME,
        kernel_spec_manager=ksm,
    )

    client = NotebookClient(
        notebook,
        km=km,
        timeout=timeout,
    )
    executed = client.execute()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fh:
        nbformat.write(executed, fh)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Execute a notebook using an explicit KernelManager and local kernelspec."
    )
    parser.add_argument("input", help="Input notebook path")
    parser.add_argument("output", help="Output notebook path")
    parser.add_argument(
        "--runtime-dir",
        default=".jupyter-local-runtime",
        help="Directory for the generated launcher and kernelspec",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=120,
        help="Cell execution timeout in seconds",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    runtime_dir = Path(args.runtime_dir).resolve()

    execute_notebook(
        input_path=input_path,
        output_path=output_path,
        runtime_dir=runtime_dir,
        timeout=args.timeout,
    )
    print(f"executed: {input_path}")
    print(f"wrote: {output_path}")
    print(f"runtime: {runtime_dir}")
    print(f"python: {sys.executable}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
