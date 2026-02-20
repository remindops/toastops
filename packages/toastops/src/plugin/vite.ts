import { fetchAndWriteLockfile, type ToastOpsPluginOptions } from './core';

/**
 * Vite plugin for ToastOps
 * Generates the lockfile and handles CSS emission during Vite initialization.
 */
export function toastopsPlugin(options: ToastOpsPluginOptions) {
  return {
    name: 'vite-plugin-toastops',
    enforce: 'pre' as const, // Run explicitly before other plugins process CSS
    async buildStart() {
      // In Vite, buildStart hooks are async natively so we can await securely
      try {
        await fetchAndWriteLockfile(options);
      } catch (err) {
        console.error(err);
        // Explicitly fail the build if the plugin fails completely
        process.exit(1);
      }
    }
  };
}
