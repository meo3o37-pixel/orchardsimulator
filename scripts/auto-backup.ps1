param(
  [int]$IntervalSec = 300,
  [switch]$Once
)

$sourceDir = (Get-Location).Path
$backupRoot = Join-Path $sourceDir ".local_backups"

function Invoke-AutoBackup {
  if (!(Test-Path -LiteralPath $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
  }

  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $dest = Join-Path $backupRoot "backup_$stamp"
  New-Item -ItemType Directory -Path $dest | Out-Null

  $null = robocopy $sourceDir $dest /E /XD ".git" "node_modules" "dist" ".local_backups"
  if ($LASTEXITCODE -ge 8) {
    Write-Host "auto-backup: failed (code $LASTEXITCODE)"
    return
  }
  Write-Host "auto-backup: completed -> $dest"
}

if ($Once) {
  Invoke-AutoBackup
  exit 0
}

Write-Host "auto-backup: running every $IntervalSec seconds"
while ($true) {
  Invoke-AutoBackup
  Start-Sleep -Seconds $IntervalSec
}

