import { fetchAndWriteLockfile, type ToastOpsPluginOptions } from './core';

/**
 * Next.js plugin to explicitly wrap the next.config.mjs
 * Generates the lockfile and handles the CSS emission during Webpack initialization.
 */
export function withToastOps(options: ToastOpsPluginOptions) {
  // We perform the sync/fetch explicitly right before Next config loads
  // because we need the files specifically populated before webpack parses Next modules.
  
  // Wrap in async IIFE or top-level await is handled by Next in .mjs
  // But for standard Webpack plugin approach, we use a compiler hook if Next relies on it.
  
  return (nextConfig: any = {}) => {
    return {
      ...nextConfig,
      webpack: (config: any, context: any) => {
        // Only run fetch exactly once per build (usually on server target to avoid double execution)
        if (context.isServer) {
          // Warning: Webpack is synchronous, so we offload explicitly but synchronously write.
          // For simplicity in this native approach, we assume users trigger our standalone CLI or 
          // we use a top-level await in modern next.config.mjs.
          fetchAndWriteLockfile(options).catch((err) => {
            console.error(err);
            process.exit(1);
          });
        }
        
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, context);
        }

        return config;
      },
    };
  };
}
