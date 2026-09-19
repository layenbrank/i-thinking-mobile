# i-thinking

基于 Expo SDK 54 的移动端客户端：**磁贴首页** + **Agent 对话**（参考桌面 [i-thinking Studio](https://github.com/layenbrank/i-thinking)、[corex](https://github.com/layenbrank/corex)、[rust-service](https://github.com/layenbrank/rust-service)）。

## 技术栈

- Expo SDK 54 / React Native 0.81
- expo-router、Zustand、TanStack Query、Zod
- NativeWind、react-native-mmkv
- 在线能力对接 rust-service（JWT + OpenAI 兼容 gateway SSE）

## 功能

| 模块 | 说明 |
|------|------|
| 磁贴 | 本地镜像：navigation / clock / markdown / intelligence（入口进 Agent） |
| Agent | `POST /api/v1/gateway/chat/completions` 流式对话；未配置 API 时本地演示回显 |
| 认证 | 用户名密码；`authMode=remote` 走 rust-service，否则本地 MMKV 演示账号 |

## 配置

在 `app.json` → `expo.extra` 或环境变量中设置：

| 键 | 说明 |
|----|------|
| `EXPO_PUBLIC_API_BASE_URL` / `extra.apiBaseUrl` | rust-service 根地址，如 `http://127.0.0.1:3000` |
| `EXPO_PUBLIC_AUTH_MODE` / `extra.authMode` | `remote` \| `local` |
| `EXPO_PUBLIC_DEFAULT_MODEL` / `extra.defaultModel` | gateway 模型名 |

开发联调 rust-service 时建议关闭行为验证码（`auth.captcha.enabled: false`），或后续接入 captcha 题型 UI。

## 快速开始

完整说明见 [docs/getting-started.md](docs/getting-started.md)。

```bash
bun install
# 或 pnpm install

# 本地演示（默认 authMode=local）
bun run dev

# 连接 rust-service
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000 EXPO_PUBLIC_AUTH_MODE=remote bun run dev
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器（dev-client） |
| `bun run typecheck` | TypeScript 检查 |
| `bun run test` | 单元测试 |
| `bun run lint` / `format` | 代码检查与格式化 |

## 应用标识

- iOS `bundleIdentifier`：`com.ithinking.app`
- Android `package`：`com.ithinking.app`
