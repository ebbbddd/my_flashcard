# 部署到飞书自建应用

目标形态：

```text
飞书自建应用入口 -> HTTPS Web 服务 -> 飞书 OpenAPI -> 飞书文档内容
```

## 1. 创建飞书自建应用

在飞书开放平台创建自建应用，记录：

- App ID
- App Secret

## 2. 开通权限

当前刷新文档需要：

- `docs:document.content:read`
- `wiki:node:read`

如果使用应用身份读取 Wiki/Docx，需要确保应用对目标文档有访问权限。Wiki 链接会先通过 `wiki/v2/spaces/get_node` 解析到底层 `docx` token，再读取文档内容。

## 3. 部署到 Vercel

项目已经包含 Vercel Serverless Function：

```text
api/refresh-document.js
```

在 Vercel 中：

1. New Project
2. Import 这个 GitHub 仓库
3. Framework Preset 选 `Other`
4. Build Command 留空或使用默认
5. Output Directory 留空
6. 添加环境变量

环境变量：

```text
FEISHU_APP_ID=你的 App ID
FEISHU_APP_SECRET=你的 App Secret
FEISHU_OPEN_API_BASE=https://open.feishu.cn/open-apis
```

本地开发时仍可运行：

```bash
npm start
```

如果本地不设置 `FEISHU_APP_ID` / `FEISHU_APP_SECRET`，`server.js` 会继续使用本机 `lark-cli docs +fetch` 作为 fallback。

## 4. 配置飞书网页应用入口

在飞书自建应用里添加网页应用入口，将首页地址配置成部署后的 HTTPS 地址：

```text
https://your-domain.example.com
```

然后发布应用版本，先仅对自己可见测试。

## 5. 验证

打开飞书应用入口，进入“7月学习”，点击“刷新”。

成功时应看到：

- 标题仍为“7月学习”
- 卡片数量为 16
- 第一张中文为“我第一次听到这件事的时候，也一头雾水！”
