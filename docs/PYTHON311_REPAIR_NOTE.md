---
type: canonical
source: none
sync: none
sla: none
---

# Python 3.11 Repair Note

## Observed failure

The machine-level Python 3.11 install at `C:\Users\mesha\AppData\Local\Programs\Python\Python311` is incomplete.

Symptoms observed during kernel startup work:

- `python.exe` fails before normal interpreter startup
- `ModuleNotFoundError: No module named 'encodings'`
- the install's `Lib` directory contains only:
  - `idlelib`
  - `site-packages`
  - `tkinter`
  - `turtledemo`

That is not a valid standard-library layout, so the `python311` kernelspec must not be used.

## Current safe state

- roaming Jupyter default is now `python312`
- the prior roaming kernels were disabled rather than deleted
- repo-local notebook execution uses:
  - `scripts/run_chshlab_notebook.ps1`
  - `scripts/execute_notebook_custom_km.py`

## Recommended machine-level repair

1. Remove or repair the broken Python 3.11 installation from `C:\Users\mesha\AppData\Local\Programs\Python\Python311`.
2. Reinstall Python 3.11 with the full standard library.
3. Verify that this works before recreating any kernelspec:

```powershell
C:\Users\mesha\AppData\Local\Programs\Python\Python311\python.exe -c "import encodings; print('ok')"
```

4. If Python 3.11 is needed as a notebook kernel, reinstall `ipykernel` into that interpreter and recreate the kernelspec.

## Practical recommendation

Unless there is a hard dependency on Python 3.11, keep using Python 3.12 for this repo's notebook execution path.
