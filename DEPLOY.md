# 部署指南

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 访问 http://localhost:5173

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录中。

## 部署到 GitHub Pages

### 方法 1: 使用 GitHub Actions（推荐）

1. 确保 `.github/workflows/deploy.yml` 文件存在
2. 将代码推送到 GitHub 仓库
3. GitHub Actions 会自动构建并部署到 `gh-pages` 分支
4. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

### 方法 2: 手动部署

1. 安装 gh-pages：
```bash
npm install --save-dev gh-pages
```

2. 在 `package.json` 中添加部署脚本：
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. 运行部署：
```bash
npm run deploy
```

### 方法 3: 使用 git subtree

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

## 配置说明

- `vite.config.js` 中的 `base` 选项必须设置为你的仓库名称（例如：`/CubeGames/`）
- 如果仓库在根目录，设置为 `/`
- PWA 图标需要手动添加到 `public` 目录：
  - `pwa-192x192.png` (192x192 像素)
  - `pwa-512x512.png` (512x512 像素)

## 注意事项

- 确保 GitHub Pages 设置中选择了正确的分支（通常是 `gh-pages`）
- 首次部署可能需要几分钟才能生效
- 如果遇到 404 错误，检查 `base` 配置是否正确
