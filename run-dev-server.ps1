[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
$env:LANG = "ko_KR.UTF-8"
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

try {
  $scriptPath = $MyInvocation.MyCommand.Path
  $projectDir = (Resolve-Path (Split-Path -Parent $scriptPath)).Path
  Set-Location -LiteralPath $projectDir

  $null = Start-Job -ScriptBlock {
    $url = "http://localhost:5173/"
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
      try {
        $client = [System.Net.Sockets.TcpClient]::new()
        $connectTask = $client.ConnectAsync("127.0.0.1", 5173)
        if ($connectTask.Wait(250) -and $client.Connected) {
          $client.Dispose()
          Start-Process $url
          return
        }
        $client.Dispose()
      }
      catch {
        # 서버가 준비될 때까지 잠시 기다린다.
      }
      Start-Sleep -Milliseconds 500
    }
  }

  $portableNodeDir = Join-Path $projectDir "tools\node-v24.18.0-win-x64"
  $portableNpm = Join-Path $portableNodeDir "npm.cmd"

  if (Test-Path -LiteralPath $portableNpm) {
    $env:Path = "$portableNodeDir;$env:Path"
    & $portableNpm run dev:win
  }
  elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    npm run dev:win
  }
  else {
    throw "Node.js/npm을 찾을 수 없습니다. tools\node-v24.18.0-win-x64 휴대용 런타임을 다시 설치해 주세요."
  }

  exit $LASTEXITCODE
}
catch {
  Write-Host ""
  Write-Host $_ -ForegroundColor Red
  Write-Host ""
  Read-Host "Press Enter to close"
  exit 1
}
