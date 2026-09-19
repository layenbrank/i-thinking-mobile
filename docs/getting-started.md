# 上手指南

## 环境

- Node 22+
- Bun 或 pnpm
- Expo SDK 54 Development Build（推荐）或 Expo Go（MMKV 会回落到内存存储）

```bash
bun install
bun run dev
```

## 产品形态

本应用**不是**备忘录 / 清单示例。主界面为：

1. **磁贴**：Studio 风格磁贴网格（本地持久化）
2. **Agent**：对话页，对接 rust-service gateway SSE
3. **设置**：主题、语言、清空对话、退出

## 对接 rust-service

1. 启动 [rust-service](https://github.com/layenbrank/rust-service)（默认 `http://127.0.0.1:3000`）
2. 配置：

```bash
export EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
export EXPO_PUBLIC_AUTH_MODE=remote
export EXPO_PUBLIC_DEFAULT_MODEL=gpt-4o-mini
bun run dev
```

或在 `app.json` 的 `expo.extra` 中写入同名配置。

3. 登录使用 **username + password**（与 rust-service `/api/v1/auth/signin` 一致）
4. Agent 调用 `POST /api/v1/gateway/chat/completions`（`Authorization: Bearer <JWT>`）

真机访问本机服务时，将 `127.0.0.1` 换成局域网 IP，并确认 CORS / 防火墙。

## 本地演示模式

未配置 `apiBaseUrl` 时默认 `authMode=local`：

- 注册 / 登录写入 MMKV
- Agent 返回本地演示流式回显（提示配置 API）

## 与桌面参考的对应关系

| 桌面 | 移动端 |
|------|--------|
| `apps/studio` 磁贴壳 + Agent 窗 | 本仓库 Tabs：磁贴 / Agent |
| `packages/shared` MagneticTile | `types/magnetic-tile.ts` + `stores/tileStore.ts` |
| Nest / 计划中的云端对话 | rust-service gateway |
| corex sidecar | 桌面自动化，移动端不嵌入 |
