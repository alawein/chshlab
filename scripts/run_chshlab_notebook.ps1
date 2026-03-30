$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Python312 = "C:\Users\mesha\AppData\Local\Programs\Python\Python312\python.exe"
$Executor = Join-Path $PSScriptRoot "execute_notebook_custom_km.py"
$InputNotebook = Join-Path $RepoRoot "notebooks\chshlab-simulations.ipynb"
$OutputNotebook = Join-Path $RepoRoot "output\jupyter-notebook\chshlab-simulations-executed.ipynb"
$RuntimeDir = Join-Path $RepoRoot ".jupyter-local-runtime"

if (-not (Test-Path $Python312)) {
    throw "Python 3.12 interpreter not found at $Python312"
}

& $Python312 $Executor $InputNotebook $OutputNotebook --runtime-dir $RuntimeDir --timeout 180
