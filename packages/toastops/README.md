# toastops

An BYOK (Bring-Your-Own-Key) custom toast notification library explicitly designed for high-performance React applications.

This package is part of the broader **RemindOps Custom Toast Platform**, utilizing a pure TypeScript observer pattern instead of slow React Context layers, and featuring build-time locking mechanisms to guarantee zero-latency AI theme injections.

## Features

- **Pure TypeScript Observer:** Toast queuing and lifecycle management decoupled from the React rendering engine.
- **Zero-Latency Build Fallbacks:** Includes Next.js and Vite bundler plugins that pre-fetch styles and lock them dynamically into `toastops.lock.json` to prevent build failures during API downtimes.
- **Minimal Re-renders:** A single `<Toaster />` DOM portal explicitly subscribes to state changes, completely avoiding React Context tree churn.
- **A/B Theme Variants:** Out-of-the-box support for switching variants dynamically injected by your remote design configurations.

## Installation

```bash
npm install toastops
# or
yarn add toastops
# or
pnpm add toastops
```

## Usage

### 1. Setup the Toaster

Inject the standalone React component at the root of your application.

```tsx
import { Toaster } from "toastops";

export default function App({ children }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
```

### 2. Triggering Notifications

Use the exposed pure function to trigger events from anywhere in your codebase.

```tsx
import { toast } from "toastops";

// Basic usage
toast({
  title: "Database Synced",
  description: "Your changes have been safely stored.",
  variant: "success", // corresponds to your enterprise themes
});
```

### 3. Bundler Plugins (Next.js / Vite)

To ensure the backend design themes are natively present during rendering, wrap your config.

**Next.js (`next.config.mjs`)**:

```javascript
import { withToastOps } from "toastops/next";

export default withToastOps({ apiKey: "your-project-key" })({
  reactStrictMode: true,
});
```

**Vite (`vite.config.ts`)**:

```typescript
import { defineConfig } from "vite";
import { toastopsPlugin } from "toastops/vite";

export default defineConfig({
  plugins: [toastopsPlugin({ apiKey: "your-project-key" })],
});
```

## Architecture

This library is fundamentally designed to be explicit and transparent. The `store.ts` file manages maximum toast limits (default: 5), queue memory arrays, and programmatic auto-dismissal timeouts independent of React's lifecycle.

## License

MIT License. See `LICENSE` for details.
