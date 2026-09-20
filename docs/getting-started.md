# 上手指南

## 环境

- Node 22+
- pnpm
- 本地 [rust-service](https://github.com/layenbrank/rust-service)（默认 `http://127.0.0.1:3000`）
- Expo SDK 54 Development Build（推荐）

```bash
pnpm install
pnpm run dev
```

## 产品形态

1. **磁贴**：Studio 风格磁贴网格（本地持久化）
2. **Agent**：gateway 模型列表 + SSE 对话
3. **设置**：主题、语言、清空对话、退出（`POST /auth/signout`）

## 认证链路（与 rust-service 对齐）

```text
POST /api/v1/auth/captcha
  → 滑块得到 captchaKey + captchaValue("x,y")  # 主图像素坐标，非屏幕像素
POST /api/v1/auth/signin | /signup
  → data.token (JWT)
GET  /api/v1/auth/profile   # hydrate 校验
POST /api/v1/auth/signout   # Redis 黑名单
```

Body 字段均为 camelCase：`username`、`password`、`captchaKey`、`captchaValue`、`captchaKind`。

成功信封：`code === 200000`。

### 联调注意

1. rust-service 需绑定 `0.0.0.0:3000`（见其 `config.yaml`）
2. `POST /captcha` 依赖 go-captcha 侧车；仅 `auth.captcha.enabled: false` 时会跳过 **校验**，取题仍要侧车
3. 真机上 `127.0.0.1` 指向手机自身；本仓库会把 loopback 配置改写成 Metro 的局域网 IP
4. iOS 已开启 `NSAllowsLocalNetworking`，Android 开启 `usesCleartextTraffic`，允许开发期 HTTP

## Agent 链路

```text
GET  /api/v1/gateway/models
POST /api/v1/gateway/chat/completions  # stream: true，XHR progressive
```

可选请求头：`X-Tenant-ID`。

## 配置

`app.json` → `expo.extra.apiBaseUrl`（可写 `http://127.0.0.1:3000`，客户端按平台改写），或：

```bash
# 显式指定电脑局域网 IP（不会被改写）
export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.8:3000
pnpm run dev
```
