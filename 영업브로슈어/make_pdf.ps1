# 브로슈어.html → PDF (A4 세로) 재생성. Chrome 헤드리스 사용.
$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$html = "file:///" + ($dir -replace '\\','/') + "/브로슈어.html"
$out = Join-Path $dir "MaxImpact_홈페이지제작_브로슈어.pdf"
& $chrome --headless=new --disable-gpu --no-pdf-header-footer --no-margins "--print-to-pdf=$out" $html
Write-Output "saved: $out"
