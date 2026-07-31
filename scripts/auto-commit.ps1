param(
  [int]$IntervalSec = 300,
  [switch]$Once
)

function Invoke-AutoCommit {
  git add -A | Out-Null
  git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    Write-Host "auto-commit: no changes"
    return
  }

  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $msg = "auto: $stamp ($branch)"
  git commit -m $msg | Out-Null
  Write-Host "auto-commit: committed ($msg)"
}

if ($Once) {
  Invoke-AutoCommit
  exit 0
}

Write-Host "auto-commit: running every $IntervalSec seconds"
while ($true) {
  Invoke-AutoCommit
  Start-Sleep -Seconds $IntervalSec
}
