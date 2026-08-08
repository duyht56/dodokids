#!/usr/bin/env bash
# Clone 4 repo con của Kido vào đúng thư mục. Idempotent: bỏ qua repo đã có.
set -euo pipefail

clone() {
  local dir="$1" url="$2"
  if [ -d "$dir/.git" ]; then
    echo "✓ $dir đã tồn tại — bỏ qua"
  else
    echo "→ clone $dir"
    git clone "$url" "$dir"
  fi
}

clone kido-pipeline https://github.com/kido-tth/content-pipeline.git
clone kido-server   https://github.com/kido-tth/backend.git
clone landing       https://github.com/duyht56/kido.git
clone mobile        https://github.com/kido-tth/mobile.git

echo ""
echo "Xong. Bước tiếp theo:"
echo "  1) Tạo lại các file .env (copy tay — KHÔNG có trong git)"
echo "  2) pnpm install trong từng package"
