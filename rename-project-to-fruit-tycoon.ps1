$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

function From-Utf8Base64($value) {
  return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($value))
}

$desktop = Join-Path $env:USERPROFILE "Desktop"
$oldName = From-Utf8Base64 "67CU7J2067iM7L2U65Sp"
$newName = From-Utf8Base64 "6rO87IiYIO2DgOydtOy/pA=="
$shortcutName = From-Utf8Base64 "64aN7J6l6rCc67Cc7ISc67KEIDPqsJwg7Iuk7ZaJLmxuaw=="

$oldPath = Join-Path $desktop $oldName
$newPath = Join-Path $desktop $newName
$launcherSource = Join-Path $newPath "tools\dev-server-launcher\Program.cs"
$launcherProject = Join-Path $newPath "tools\dev-server-launcher\DevServerLauncher.csproj"
$launcherOutput = Join-Path $newPath "dist-tools\FarmDevServers"
$shortcutPath = Join-Path $desktop $shortcutName
$exePath = Join-Path $launcherOutput "FarmDevServers.exe"

Write-Host "Stopping old orchard dev server processes..."
Get-CimInstance Win32_Process |
  Where-Object {
    $_.ProcessId -ne $PID -and
    (
      $_.CommandLine -like "*$oldPath*" -or
      $_.CommandLine -like "*scripts/vite-safe.mjs dev*--port 5173*"
    )
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

Start-Sleep -Milliseconds 700

if (Test-Path -LiteralPath $newPath) {
  Write-Host "Target folder already exists: $newPath"
} else {
  Write-Host "Renaming:"
  Write-Host "  $oldPath"
  Write-Host "-> $newPath"
  Rename-Item -LiteralPath $oldPath -NewName $newName
}

if (Test-Path -LiteralPath $launcherSource) {
  Write-Host "Updating launcher source path..."
  $source = Get-Content -Raw -Encoding UTF8 -LiteralPath $launcherSource
  $source = $source.Replace($oldPath, $newPath)
  Set-Content -Encoding UTF8 -LiteralPath $launcherSource -Value $source

  Write-Host "Rebuilding launcher exe..."
  dotnet publish $launcherProject -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o $launcherOutput

  Write-Host "Updating desktop shortcut..."
  $wsh = New-Object -ComObject WScript.Shell
  $link = $wsh.CreateShortcut($shortcutPath)
  $link.TargetPath = $exePath
  $link.WorkingDirectory = Split-Path -Parent $exePath
  $link.Description = "Farm/Vite/Sensor dev servers"
  $link.Save()
}

Write-Host ""
Write-Host "Done."
Write-Host "Project folder: $newPath"
Write-Host "Launcher exe: $exePath"
