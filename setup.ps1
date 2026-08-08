# Clone 4 repo con của Kido vào đúng thư mục. Idempotent: bỏ qua repo đã có.
$ErrorActionPreference = "Stop"

function Clone-Repo($dir, $url) {
  if (Test-Path "$dir/.git") {
    Write-Host "✓ $dir đã tồn tại — bỏ qua"
  } else {
    Write-Host "→ clone $dir"
    git clone $url $dir
  }
}

Clone-Repo "kido-pipeline" "https://github.com/kido-tth/content-pipeline.git"
Clone-Repo "kido-server"   "https://github.com/kido-tth/backend.git"
Clone-Repo "landing"       "https://github.com/duyht56/kido.git"
Clone-Repo "mobile"        "https://github.com/kido-tth/mobile.git"

Write-Host ""
Write-Host "Xong. Bước tiếp theo:"
Write-Host "  1) Tạo lại các file .env (copy tay — KHÔNG có trong git)"
Write-Host "  2) pnpm install trong từng package"
