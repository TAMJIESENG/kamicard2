# GitHub Pages 部署指南

## 部署步骤

### 1. 启用 GitHub Pages

1. 访问仓库：https://github.com/TAMJIESENG/kamicard2
2. 进入 **Settings** → **Pages**
3. 在 **Source** 部分，选择 **GitHub Actions**
4. 保存设置

### 2. 等待自动部署

- 每次推送到 `master` 分支时，GitHub Actions 会自动构建和部署
- 可以在 **Actions** 标签页查看部署进度
- 部署完成后，访问地址：`https://TAMJIESENG.github.io/kamicard2/`

### 3. 访问地址

正确的访问地址格式：
- ✅ `https://TAMJIESENG.github.io/kamicard2/`
- ✅ `https://TAMJIESENG.github.io/kamicard2/login`
- ❌ `https://TAMJIESENG.github.io/kamicard2` (缺少尾部斜杠)

## 配置说明

### Base 路径配置

项目已配置为使用 `/kamicard2/` 作为 base 路径：

- `vite.config.js`: `base: '/kamicard2/'`
- `src/router/index.js`: `createWebHistory('/kamicard2/')`

### 重要文件

- `.nojekyll`: 防止 GitHub Pages 使用 Jekyll 处理，确保所有文件都能正确访问
- `404.html`: SPA 路由重定向脚本，确保刷新页面时能正确加载

## 故障排除

### 如果遇到 404 错误

1. **检查 GitHub Pages 是否已启用**
   - 进入 Settings → Pages
   - 确认 Source 设置为 "GitHub Actions"

2. **检查部署状态**
   - 进入 Actions 标签页
   - 查看最新的部署工作流是否成功

3. **清除浏览器缓存**
   - 按 `Ctrl + Shift + Delete` 清除缓存
   - 或使用无痕模式访问

4. **检查访问 URL**
   - 确保 URL 包含 `/kamicard2/` 路径
   - 确保 URL 末尾有斜杠（对于根路径）

5. **等待部署完成**
   - 首次部署可能需要几分钟
   - 部署完成后，GitHub 会发送通知邮件

### 手动触发部署

如果需要手动触发部署：

1. 进入 **Actions** 标签页
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow** 按钮

## 本地测试

在推送到 GitHub 之前，可以在本地测试构建：

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

访问 `http://localhost:4173/kamicard2/` 查看预览效果。

## 注意事项

- 不要直接提交 `dist` 目录到仓库（已在 `.gitignore` 中排除）
- 所有部署都通过 GitHub Actions 自动完成
- 确保 `package.json` 中的依赖版本正确
- 如果修改了 base 路径，需要同时更新 `vite.config.js` 和 `src/router/index.js`

