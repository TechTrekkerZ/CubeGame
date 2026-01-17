# 魔方小游戏

一个使用 React + Vite + Three.js 开发的 3D 魔方小游戏，支持 PWA（可添加到桌面）和 GitHub Pages 部署。

## 功能特性

- 🎮 3D 魔方渲染（使用 Three.js）
- 🔄 魔方旋转操作（R, L, U, D, F, B 及其逆时针操作）
- 🎲 随机打乱功能
- 🔁 重置功能
- 📱 PWA 支持（可添加到手机/电脑桌面）
- 🎨 现代化 UI 设计
- 📊 操作历史记录

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **Three.js** - 3D 渲染
- **@react-three/fiber** - React Three.js 渲染器
- **@react-three/drei** - Three.js 辅助库
- **vite-plugin-pwa** - PWA 支持

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 部署到 GitHub Pages

1. 确保 `vite.config.js` 中的 `base` 设置为你的仓库名称（例如：`/CubeGame/`）

2. 构建项目：
```bash
npm run build
```

3. 将 `dist` 目录的内容推送到 GitHub 仓库的 `gh-pages` 分支：

```bash
# 安装 gh-pages（如果还没有）
npm install --save-dev gh-pages

# 添加部署脚本到 package.json
# "deploy": "npm run build && gh-pages -d dist"

# 运行部署
npm run deploy
```

或者手动操作：

```bash
git subtree push --prefix dist origin gh-pages
```

4. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

## 使用说明

### 基本操作

- **拖动鼠标**：旋转视角
- **滚轮**：缩放魔方
- **点击按钮**：执行魔方旋转操作

### 魔方操作符号

- `R` / `R'` - 右面顺时针/逆时针
- `L` / `L'` - 左面顺时针/逆时针
- `U` / `U'` - 上面顺时针/逆时针
- `D` / `D'` - 下面顺时针/逆时针
- `F` / `F'` - 前面顺时针/逆时针
- `B` / `B'` - 后面顺时针/逆时针

### PWA 安装

1. 在支持的浏览器（Chrome、Edge、Safari）中打开应用
2. 点击地址栏的安装图标
3. 或通过菜单选择"添加到主屏幕"
4. 应用将像原生应用一样运行

## 项目结构

```
CubeGames/
├── src/
│   ├── components/
│   │   ├── RubiksCube.jsx      # 魔方 3D 组件
│   │   ├── RubiksCube.css
│   │   ├── ControlPanel.jsx    # 控制面板
│   │   └── ControlPanel.css
│   ├── utils/
│   │   └── cubeLogic.js        # 魔方旋转逻辑
│   ├── App.jsx                 # 主应用组件
│   ├── App.css
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式
├── public/                     # 静态资源
├── index.html
├── vite.config.js              # Vite 配置（包含 PWA）
├── package.json
└── README.md
```

## 开发计划

- [ ] 实现完整的魔方旋转动画
- [ ] 添加魔方求解算法提示
- [ ] 添加计时器功能
- [ ] 添加魔方状态保存/加载
- [ ] 优化移动端体验
- [ ] 添加更多魔方尺寸（2x2, 4x4 等）

## 许可证

MIT
