# i-thinking

基于 Expo SDK 54 的备忘录与清单移动应用（React Native + expo-router）。

## 技术栈

- Expo SDK 54 / React Native 0.81
- expo-router、Zustand、TanStack Query、Zod
- NativeWind、react-native-mmkv、expo-notifications
- EAS Build / Submit / Update

依赖逐项说明见 [docs/dependencies.md](docs/dependencies.md)。

## 快速开始

完整环境配置、真机调试、打包与发布说明见：

→ [docs/getting-started.md](docs/getting-started.md)

```bash
bun install
npx eas-cli@latest login
npx eas-cli@latest init
bun run build:android   # 或 build:ios，打开发包并安装到真机
bun run dev             # 启动 Metro，用 Development Build 连接
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器（dev-client） |
| `bun run build:android` / `build:ios` | 打 development 包 |
| `bun run build:preview` | 打内测预览包（Android APK） |
| `bun run prod` | 打 Android + iOS 生产包 |
| `bun run prod:android` / `prod:ios` | 打单端生产包 |
| `bun run submit:android` / `submit:ios` | 提交到应用商店 |
| `bun run update:prod` | 生产环境 OTA 热更新 |
| `bun run typecheck` | TypeScript 检查 |
| `bun run test` | 单元测试 |
| `bun run lint` / `format` | 代码检查与格式化 |

## 应用标识

- iOS `bundleIdentifier`：`com.ithinking.app`
- Android `package`：`com.ithinking.app`

## 文档

- [上手指南](docs/getting-started.md) — 环境、真机、打包、发布、环境区分
- [依赖与工具链](docs/dependencies.md) — `package.json` 依赖说明（新手第一步）
- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
