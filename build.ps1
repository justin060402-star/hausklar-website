<#
  Statischer Seiten-Builder für HausKlar Oberfranken.
  Setzt Partials (head/header/footer/modal) + Seiteninhalte aus src/pages
  zu fertigen, eigenstaendigen HTML-Dateien in /dist zusammen.
  Kein Node/npm noetig - reines PowerShell-String-Templating.
#>

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dist = Join-Path $root "dist"

function Write-Utf8NoBom($path, $content) {
  $dir = Split-Path $path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
}

# --- 1) dist leeren & assets kopieren ---
if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Force -Path $dist | Out-Null
Copy-Item -Recurse (Join-Path $root "assets") (Join-Path $dist "assets")

# --- 2) Partials laden ---
$partialsDir = Join-Path $root "src\partials"
$headTpl = Get-Content (Join-Path $partialsDir "head.html") -Raw -Encoding UTF8
$headerTpl = Get-Content (Join-Path $partialsDir "header.html") -Raw -Encoding UTF8
$footerTpl = Get-Content (Join-Path $partialsDir "footer.html") -Raw -Encoding UTF8
$modalTpl = Get-Content (Join-Path $partialsDir "modal-anfrage.html") -Raw -Encoding UTF8
$cookieBannerTpl = Get-Content (Join-Path $partialsDir "cookie-banner.html") -Raw -Encoding UTF8
$whatsappWidgetTpl = Get-Content (Join-Path $partialsDir "whatsapp-widget.html") -Raw -Encoding UTF8

$scriptsTpl = @"
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="{{PREFIX}}assets/js/lenis-init.js"></script>
<script src="{{PREFIX}}assets/js/animations.js"></script>
<script src="{{PREFIX}}assets/js/nav.js"></script>
<script src="{{PREFIX}}assets/js/modal.js"></script>
<script src="{{PREFIX}}assets/js/cookie-consent.js"></script>
<script src="{{PREFIX}}assets/js/whatsapp-widget.js"></script>
"@

# --- 3) Seiten einlesen & bauen ---
$pagesDir = Join-Path $root "src\pages"
$pageFiles = Get-ChildItem -Recurse -File -Path $pagesDir -Filter "*.html"

$count = 0
foreach ($file in $pageFiles) {
  $relPath = $file.FullName.Substring($pagesDir.Length + 1)
  $isSub = $relPath -match "^leistungen[\\/]"
  $prefix = if ($isSub) { "../" } else { "" }

  $raw = Get-Content $file.FullName -Raw -Encoding UTF8
  if ($raw -notmatch "(?s)^<!--META\r?\n(?<meta>.*?)-->\r?\n?(?<body>.*)$") {
    throw "Kein META-Block gefunden in $($file.FullName)"
  }
  $metaBlock = $Matches["meta"]
  $body = $Matches["body"]

  $meta = @{}
  foreach ($line in ($metaBlock -split "`r?`n")) {
    if ($line -match "^\s*([a-zA-Z_]+)\s*:\s*(.*)$") {
      $meta[$Matches[1]] = $Matches[2].Trim()
    }
  }

  $title = $meta["title"]
  $description = $meta["description"]
  $canonical = $meta["canonical"]
  $bodyClass = $meta["bodyclass"]
  $pageCss = $meta["pagecss"]

  $head = $headTpl
  $head = $head.Replace("{{TITLE}}", $title)
  $head = $head.Replace("{{DESCRIPTION}}", $description)
  $head = $head.Replace("{{CANONICAL}}", $canonical)
  $head = $head.Replace("{{PAGE_CSS}}", $pageCss)
  $head = $head.Replace("{{PREFIX}}", $prefix)

  $header = $headerTpl.Replace("{{PREFIX}}", $prefix)
  $footer = $footerTpl.Replace("{{PREFIX}}", $prefix)
  $modal = $modalTpl
  $cookieBanner = $cookieBannerTpl.Replace("{{PREFIX}}", $prefix)
  $whatsappWidget = $whatsappWidgetTpl.Replace("{{PREFIX}}", $prefix)
  $scripts = $scriptsTpl.Replace("{{PREFIX}}", $prefix)
  $bodyFinal = $body.Replace("{{PREFIX}}", $prefix)

  $html = @"
<!doctype html>
<html lang="de">
<head>
$head
</head>
<body class="$bodyClass">
$header
$bodyFinal
$footer
$modal
$cookieBanner
$whatsappWidget
$scripts
</body>
</html>
"@

  $outPath = Join-Path $dist $relPath
  Write-Utf8NoBom $outPath $html
  $count++
}

Write-Host "Build abgeschlossen: $count Seiten erzeugt in $dist"
