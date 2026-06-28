---
name: react-native-maps web crash
description: How to handle react-native-maps in an Expo web+native project without crashing Metro on web
---

## Rule
Never import `react-native-maps` at module level in any file that is bundled for web. Even `Platform.OS !== 'web'` runtime checks do NOT prevent Metro from bundling the module, causing `codegenNativeComponent is not a function` crashes.

**Why:** Metro resolves all static imports at bundle time regardless of runtime platform checks.

**How to apply:** Use Expo's platform-extension resolution:
- `components/MapView.tsx` — web-safe fallback (LinearGradient or plain View)
- `components/MapView.native.tsx` — actual react-native-maps implementation

Then import `@/components/MapView` from any screen — Metro will automatically pick the right file.
