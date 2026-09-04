# Original FillUp vector mark; render PNG app icons without external assets.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
foreach ($spec in @(@('icon-192.png', 192), @('icon-512.png', 512), @('icon-maskable-512.png', 512), @('apple-touch-icon.png', 180))) {
  $size = [int]$spec[1]
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#087f6d'))
  $scale = $size / 64.0
  $graphics.ScaleTransform($scale, $scale)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3.8)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  # Keep the full mark inside the maskable icon safe zone.
  $graphics.TranslateTransform(3, 5)
  $graphics.ScaleTransform(0.82, 0.82)
  $graphics.DrawLine($pen, 18, 47, 18, 18)
  $graphics.DrawLine($pen, 18, 18, 40, 18)
  $graphics.DrawLine($pen, 40, 18, 40, 47)
  $graphics.DrawLine($pen, 14, 47, 44, 47)
  $graphics.DrawLine($pen, 18, 30, 40, 30)
  $graphics.DrawLine($pen, 40, 31, 44, 31)
  $graphics.DrawArc($pen, 44, 31, 8, 8, 270, 90)
  $graphics.DrawLine($pen, 48, 35, 48, 41)
  $graphics.DrawArc($pen, 48, 38, 6, 6, 0, 180)
  $graphics.DrawLine($pen, 54, 41, 54, 25)
  $graphics.DrawLine($pen, 54, 25, 47, 18)
  $graphics.DrawLine($pen, 50, 21, 50, 29)
  $graphics.DrawLine($pen, 50, 29, 54, 29)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#b1e4c8'))
  $graphics.FillRectangle($brush, 23, 22, 12, 4)
  $destination = Join-Path $projectRoot ('public/' + $spec[0])
  $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $brush.Dispose()
  $pen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
