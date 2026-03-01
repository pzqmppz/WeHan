# Coze Web SDK 集成指南

> 用于 WeHan C 端落地页开发，将智能体嵌入网页

---

## 一、SDK 概述

Coze Web SDK 允许将智能体（Bot）嵌入到网页中，用户可以直接在网页上与智能体对话。

### 支持的集成方式

| 方式 | 说明 | 适用场景 |
|-----|------|---------|
| 悬浮按钮 | 右下角悬浮聊天按钮 | 客服、助手 |
| 内嵌页面 | 嵌入到指定 DOM 元素 | 全屏对话、落地页 |
| iframe | 独立 iframe 窗口 | 隔离环境 |

---

## 二、快速开始

### 1. 引入 SDK

**方式一：Script 标签（推荐）**

```html
<script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js"></script>
```

**方式二：动态加载**

```javascript
var webSdkScript = document.createElement('script');
webSdkScript.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js';
document.head.appendChild(webSdkScript);
```

### 2. 初始化 WebChatClient

```javascript
new CozeWebSDK.WebChatClient({
  config: {
    bot_id: 'YOUR_BOT_ID',  // 必填：智能体 ID
  },
  auth: {
    type: 'token',
    token: 'YOUR_TOKEN',  // Personal Access Token
    onRefreshToken: () => 'YOUR_TOKEN'  // Token 刷新函数
  }
});
```

---

## 三、完整配置说明

### 配置结构

```javascript
const client = new CozeWebSDK.WebChatClient({
  config: {
    bot_id: 'string',           // 必填：智能体 ID
    isIframe: true,             // 可选：是否使用 iframe，默认 true
    botInfo: {
      parameters: {             // 可选：传递给智能体的参数
        user_name: 'John'
      }
    }
  },
  auth: {
    type: 'token',              // 认证类型
    token: 'pat_xxx',           // Access Token
    onRefreshToken: async () => 'pat_xxx'  // Token 刷新回调
  },
  ui: {
    asstBtn: {
      isNeed: true,             // 是否显示悬浮按钮
    },
    chatBot: {
      el: document.getElementById('chat-container')  // 挂载元素
    }
  },
  componentProps: {
    title: 'WeHan 求职助手',    // 聊天窗口标题
    icon: 'https://xxx.png',    // 图标 URL
    lang: 'zh-CN',              // 语言：'zh-CN' | 'en'
    layout: 'pc',               // 布局：'pc' | 'mobile'
    width: 800,                 // 宽度（像素）
  }
});
```

---

## 四、集成示例

### 示例 1：全屏落地页

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WeHan 求职助手</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; }
    #chat-container {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="chat-container"></div>

  <script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js"></script>
  <script>
    const client = new CozeWebSDK.WebChatClient({
      config: {
        bot_id: 'YOUR_BOT_ID',
      },
      auth: {
        type: 'token',
        token: 'YOUR_TOKEN',
        onRefreshToken: () => 'YOUR_TOKEN'
      },
      ui: {
        asstBtn: {
          isNeed: false,  // 不显示悬浮按钮
        },
        chatBot: {
          el: document.getElementById('chat-container')  // 全屏挂载
        }
      },
      componentProps: {
        title: 'WeHan 求职助手',
        lang: 'zh-CN',
        layout: 'pc',
      }
    });
  </script>
</body>
</html>
```

### 示例 2：悬浮按钮（客服模式）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>WeHan 求职助手</title>
</head>
<body>
  <h1>欢迎访问 WeHan</h1>
  <p>点击右下角按钮开始对话</p>

  <script src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js"></script>
  <script>
    new CozeWebSDK.WebChatClient({
      config: {
        bot_id: 'YOUR_BOT_ID',
      },
      auth: {
        type: 'token',
        token: 'YOUR_TOKEN',
        onRefreshToken: () => 'YOUR_TOKEN'
      },
      ui: {
        asstBtn: {
          isNeed: true,  // 显示悬浮按钮
        }
      },
      componentProps: {
        title: 'WeHan 求职助手',
        lang: 'zh-CN',
      }
    });
  </script>
</body>
</html>
```

---

## 五、API 方法

### 显示/隐藏聊天窗口

```javascript
const client = new CozeWebSDK.WebChatClient({...});

// 显示聊天窗口
client.showChatBot();

// 隐藏聊天窗口
client.hideChatBot();
```

---

## 六、WeHan 项目集成方案

### 域名配置

| 域名 | 用途 | 实现方式 |
|-----|------|---------|
| `wehan.dolosy.cn` | C 端落地页 | HTML + Chat SDK |
| `rcjc.dolosy.cn` | B 端管理后台 | Next.js |

### 落地页需求

1. **全屏对话界面** - 用户进入即可开始对话
2. **品牌展示** - 显示 WeHan Logo 和名称
3. **移动端适配** - 支持手机访问

### 实现步骤

1. 在扣子平台发布智能体，获取 Bot ID
2. 创建 Personal Access Token (PAT)
3. 创建 HTML 落地页，嵌入 Chat SDK
4. 部署到服务器 `/www/wwwroot/wehan.dolosy.cn/`

---

## 七、注意事项

### Token 安全

- PAT Token 应该在服务端动态生成，避免硬编码
- 对于公开访问，考虑使用匿名模式或服务端代理

### 跨域问题

- SDK 支持跨域访问
- 如遇问题，检查 CSP (Content Security Policy) 配置

### 移动端适配

```javascript
componentProps: {
  layout: window.innerWidth < 768 ? 'mobile' : 'pc',
}
```

---

## 八、发布流程

1. **扣子平台** → 智能体 → 发布 → 选择「Chat SDK」
2. 获取 Bot ID
3. 创建 PAT：扣子平台 → 个人设置 → API Token
4. 将 Bot ID 和 Token 填入落地页代码
5. 部署到服务器

---

## 九、参考链接

- [Web SDK 概述](https://www.coze.cn/open/docs/developer_guides/web_sdk_overview)
- [安装 Web SDK](https://www.coze.cn/open/docs/developer_guides/install_web_sdk)
- [Chat SDK FAQ](https://www.coze.cn/open/docs/developer_guides/chat_sdk_faq)

---

*文档版本: 1.0 | 创建时间: 2026-03-01 | 用于 WeHan C 端集成*
