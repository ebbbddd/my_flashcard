# 英语学习卡片

一个最小可用的飞书文档学习卡片原型。

## 当前功能

- 首页展示可学习的飞书文档标题
- 支持添加飞书文档链接，新增入口会保存到浏览器本地
- 点击文档进入卡片模式
- 卡片正面展示中文
- 点击卡片或“看英文”翻到英文
- 支持上一个/下一个卡片
- 手动刷新当前飞书文档，刷新后重新解析卡片内容

## 数据来源

当前已接入初始文档：

https://bytedance.larkoffice.com/wiki/N60rwuySCiUHCikE2PFcOo5Jnwc

读取到的文档标题为“7月学习”，并按英文段落 + 中文段落交替的规则生成了 16 张卡片。

## 本地预览

```bash
npm start
```

然后打开：

```text
http://localhost:4174
```

刷新功能需要通过 `server.js` 调用 `lark-cli docs +fetch`，直接用 `file://` 打开页面时也可以使用刷新，但要先启动上面的本地服务。

## 部署

部署为飞书自建应用入口时，参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

项目已支持 Vercel Serverless Functions。部署后，前端会调用同域名下的：

```text
/api/refresh-document
```
