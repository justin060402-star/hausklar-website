<#
  Minimaler statischer HTTP-Server (kein Node noetig) zum lokalen Vorschauen von /dist.
#>
$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "dist"
$port = 8080

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".json" = "application/json"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "HausKlar Preview laeuft auf http://localhost:$port/ (Strg+C zum Beenden)"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    try {
      $res.KeepAlive = $false
      $res.SendChunked = $false
      $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
      if ($path -eq "/") { $path = "/index.html" }
      $filePath = Join-Path $root ($path.TrimStart("/") -replace "/", "\")
      if ((Test-Path $filePath -PathType Container)) {
        $filePath = Join-Path $filePath "index.html"
      }
      if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = $mime[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.StatusCode = 200
        $res.ContentType = $contentType
        if ($contentType -like "text/*" -or $contentType -like "application/javascript*" -or $contentType -like "application/json*") {
          $res.ContentEncoding = [System.Text.Encoding]::UTF8
        }
        $res.ContentLength64 = [int64]$bytes.Length
        if ($req.HttpMethod -ne "HEAD") {
          $res.OutputStream.Write($bytes, 0, $bytes.Length)
        }
      } else {
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
        $res.StatusCode = 404
        $res.ContentType = "text/plain; charset=utf-8"
        $res.ContentLength64 = [int64]$msg.Length
        if ($req.HttpMethod -ne "HEAD") {
          $res.OutputStream.Write($msg, 0, $msg.Length)
        }
      }
    } catch {
      try { $res.StatusCode = 500 } catch {}
      Write-Host "Fehler bei $($req.Url): $($_.Exception.Message)"
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
