# Copies the provided badge file into the public assets directory if present at /mnt/data
$src = "/mnt/data/292d3d87-559c-4104-949b-562ab2bad432.png"
$dst = "public/assets/badge.png"
if (Test-Path $src) {
  Copy-Item -Path $src -Destination $dst -Force
  Write-Host "Badge copied to $dst"
} else {
  Write-Host "Badge not found at $src. Please place the badge at that path or copy manually to $dst"
}
