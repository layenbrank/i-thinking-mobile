# 上手指南

本文说明开发前环境准备、Android / iOS 真机测试、打包与发布流程，以及各环境的区别。

刚接触 React Native 时，建议先读 **[依赖与工具链说明](./dependencies.md)**，弄清 `package.json` 里各包的职责，再回到本文完成环境与真机配置。

## 1. 开发前环境配置

### 必备

| 工具 | 说明 |
|------|------|
| Node.js | 建议 20.19+（Expo SDK 54 要求） |
| Bun | 本仓库包管理器（也可用 npm / yarn） |
| Git | 版本管理 |
| Expo 账号 | [expo.dev](https://expo.dev/signup) 注册，用于 EAS |
| EAS CLI | `npm install -g eas-cli` 或使用 `npx eas-cli@latest` |

### 推荐（按平台）

| 场景 | 需要 |
|------|------|
| Android 真机 / 模拟器 | [Android Studio](https://developer.android.com/studio)、USB 调试或无线调试 |
| iOS 模拟器 | **仅 macOS** + Xcode |
| iOS 真机（本地编译） | **仅 macOS** + Xcode + 付费 [Apple Developer](https://developer.apple.com) |
| iOS 真机（云端 EAS） | 付费 Apple Developer；可在 Windows 上触发云端构建 |
| 上架 Google Play | [Google Play Console](https://play.google.com/console)（一次性约 $25） |
| 上架 App Store | Apple Developer Program（约 $99/年） |

本项目依赖原生模块（如 `react-native-mmkv`、完整通知能力），**不要用 Expo Go 作为主开发方式**。请使用 **Development Build**（见下文）。

### 首次初始化

```bash
# 安装依赖
bun install

# 登录 Expo
npx eas-cli@latest login

# 绑定 EAS 项目（写入 projectId）
npx eas-cli@latest init
```

确认 `app.json` 中已有：

- `ios.bundleIdentifier`: `com.ithinking.app`
- `android.package`: `com.ithinking.app`

## 2. 环境区分

项目通过 EAS 的 **build profile** 区分用途（见 `eas.json`）：

| 环境 / Profile | 命令 | 用途 | 安装方式 |
|---------------|------|------|----------|
| **development** | `bun run build:android` / `build:ios` | 日常开发，含 `expo-dev-client`，可连本地 Metro | 内部分发，装 APK / 真机包 |
| **preview** | `bun run build:preview` | 内测给同事，接近正式包但不含开发菜单 | Android APK，内部分发 |
| **production** | `bun run prod` / `prod:android` / `prod:ios` | 上架商店的正式包 | Play / App Store |
| **OTA 热更新** | `bun run update:prod` | 仅更新 JS/资源，不重打原生包 | 已安装的 production 客户端 |

简要对照：

```text
development  →  自己开发调试（Development Build）
preview      →  内部试用
production   →  用户从商店安装
update:prod  →  商店包已上线后，只改前端逻辑时的快速下发
```

开发时本地跑：

```bash
bun run dev   # 等价于 expo start --dev-client
```

Metro 会优先连接 Development Build，而不是 Expo Go。

## 3. Android 真机测试

### 3.1 打开发包并安装

```bash
bun run build:android
```

构建在 EAS 云端完成。完成后：

1. 打开终端里的安装链接，或到 [expo.dev](https://expo.dev) 构建详情页下载 APK。
2. 用手机浏览器打开链接安装，或 `adb install xxx.apk`。
3. 手机与电脑同一局域网，执行：

```bash
bun run dev
```

4. 打开手机上的 **i-thinking**（不是 Expo Go），在启动页选择当前开发服务器。

### 3.2 本机直接编译（可选）

需已安装 Android Studio 与 SDK：

```bash
bun run prebuild
npx expo run:android --device
```

适合本机有完整 Android 工具链时；日常用 EAS 云端构建即可。

### 3.3 内测包（给他人试用）

```bash
bun run build:preview
```

生成可直接安装的 APK，无需连 Metro。

## 4. iOS 真机测试

### 4.1 用 EAS 云端构建（Windows / Mac 均可）

前提：已加入付费 Apple Developer Program。

```bash
bun run build:ios
```

首次会提示登录 Apple 账号并生成证书 / Provisioning Profile（可由 EAS 托管）。

构建完成后：

1. 用 iPhone 扫码或通过链接安装（内部分发 / ad hoc）。
2. 若提示「未受信任的企业级开发者」，到 **设置 → 通用 → VPN 与设备管理** 中信任证书。
3. 开启 [开发者模式](https://docs.expo.dev/guides/ios-developer-mode/)（iOS 16+）。
4. 电脑执行 `bun run dev`，在 App 启动页连接开发服务器。

### 4.2 仅 Mac：本地编译到真机

```bash
bun run prebuild
npx expo run:ios --device
```

### 4.3 iOS 模拟器（仅 Mac）

使用 `eas.json` 中的 `development-simulator` profile：

```bash
eas build --platform ios --profile development-simulator
```

或本机：

```bash
npx expo run:ios
```

> Windows 无法跑 iOS 模拟器；真机包请用 EAS 云端构建。

## 5. 如何打包

| 目标 | 命令 | 产物 |
|------|------|------|
| 开发包 Android | `bun run build:android` | APK（含 dev-client） |
| 开发包 iOS | `bun run build:ios` | 真机可安装包（含 dev-client） |
| 内测 Android | `bun run build:preview` | APK |
| 生产双端 | `bun run prod` | 商店用 AAB / IPA |
| 生产仅 Android | `bun run prod:android` | AAB（默认） |
| 生产仅 iOS | `bun run prod:ios` | IPA |

查看构建状态：

```bash
npx eas-cli@latest build:list
```

或打开 [expo.dev](https://expo.dev) 项目页的 Builds。

**何时需要重新打原生包：**

- 新增 / 升级带原生代码的依赖
- 修改 `app.json` 插件或权限
- 升级 Expo SDK

只改 TS/JS/样式时，开发阶段热更新即可；已上架可用 `bun run update:prod`。

## 6. 如何发布

### 6.1 打生产包

```bash
bun run prod
# 或
bun run prod:android
bun run prod:ios
```

### 6.2 提交到应用商店

```bash
bun run submit:android   # Google Play
bun run submit:ios       # App Store Connect
```

也可在 EAS 构建详情页点击 Submit。

提交后仍需在各商店后台完善：

- 应用名称、描述、截图、隐私政策
- 内容分级、测试账号（如需要）
- 等待审核

### 6.3 上线后热更新（可选）

未改原生代码时：

```bash
bun run update:prod
# 建议带说明：
eas update --branch production --message "修复登录文案"
```

用户下次打开 App 即可拉取 JS 更新（需项目已配置 EAS Update；生产包需启用 updates）。

## 7. 推荐日常流程

```text
首次
  bun install → eas login → eas init → build:android / build:ios → 装到手机

每天开发
  bun run dev → 打开 Development Build → 改代码热更新

给同事试用
  bun run build:preview → 发安装链接

准备上架
  bun run prod → bun run submit:android / submit:ios

小改动已上架
  bun run update:prod
```

## 8. 常见问题

**Q: 为什么不能一直用 Expo Go？**  
A: 本项目使用 MMKV（NitroModules）等原生能力，Expo Go 未内置，运行会报错。请用 Development Build。

**Q: `bun run dev` 还是打开了 Expo Go？**  
A: 先安装 development 包，从桌面打开该 App 再连服务器；或确认脚本为 `expo start --dev-client`。

**Q: iOS 构建失败 / 无法安装？**  
A: 确认 Apple Developer 账号有效、Bundle ID 与证书匹配，并在设备上信任开发者证书。

**Q: Android 装不上 APK？**  
A: 允许「安装未知应用」，并确认下载的是 `development` / `preview` 的 APK 而非仅适用于模拟器的产物。

## 参考链接

- [依赖与工具链说明](./dependencies.md)
- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
