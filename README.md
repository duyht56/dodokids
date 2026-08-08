# kido-app (meta repo)

Đây là **repo cha** của workspace Kido. Nó **KHÔNG** chứa mã nguồn 4 package —
mỗi package là một **repo GitHub độc lập** được clone vào đúng thư mục con.
Repo cha chỉ giữ **tài liệu & cấu hình dùng chung** ở cấp gốc:
`docs/`, `openspec/`, `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`, `.agents/`,
`.mcp.json`, `Kido UI design*/`, `dodo.png`.

## Cấu trúc workspace

```
kido-app/                 <- repo NÀY (docs + config chung)
├── kido-pipeline/        <- repo riêng: kido-tth/content-pipeline
├── kido-server/          <- repo riêng: kido-tth/backend
├── landing/              <- repo riêng: duyht56/kido
└── mobile/               <- repo riêng: kido-tth/mobile
```

| Thư mục         | GitHub repo                                             |
| --------------- | ------------------------------------------------------ |
| `kido-pipeline` | https://github.com/kido-tth/content-pipeline.git       |
| `kido-server`   | https://github.com/kido-tth/backend.git                |
| `landing`       | https://github.com/duyht56/kido.git                    |
| `mobile`        | https://github.com/kido-tth/mobile.git                 |

## Cài đặt trên máy mới

```bash
# 1. Clone repo cha
git clone <URL-repo-cha> kido-app
cd kido-app

# 2. Clone 4 repo con vào đúng chỗ (script tự bỏ qua cái đã có)
#    Windows PowerShell:
./setup.ps1
#    macOS / Linux / Git Bash:
bash setup.sh

# 3. Tạo lại các file .env (KHÔNG có trong git — copy tay từ máy cũ / trình
#    quản lý mật khẩu). Mỗi package có .env.example làm mẫu:
#      kido-pipeline/.env
#      kido-server/.env
#      mobile/.env        (nếu cần)

# 4. Cài dependencies trong TỪNG package (không có package.json ở gốc)
cd kido-pipeline && pnpm install && cd ..
cd kido-server   && pnpm install && cd ..
cd landing       && pnpm install && cd ..
cd mobile        && pnpm install && cd ..
```

## Lưu ý quan trọng

- **Không có `package.json` ở gốc.** Chạy lệnh verify/build bên trong từng package.
- **Secrets (`.env`, key, token) không bao giờ nằm trong git.** Chuyển qua kênh an
  toàn (USB, trình quản lý mật khẩu), tuyệt đối không đẩy lên GitHub.
- `.codegraph/` là index cục bộ, **không** commit — chạy lại `codegraph index` ở
  máy mới nếu dùng CodeGraph.
- Commit riêng cho từng repo con — đứng trong thư mục con rồi `git add/commit/push`
  như bình thường. Repo cha chỉ theo dõi file chung ở gốc.
