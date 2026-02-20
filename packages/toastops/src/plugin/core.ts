import fs from 'fs';
import path from 'path';

export interface ToastOpsPluginOptions {
  apiKey: string;
  endpoint?: string;
  silent?: boolean;
}

const DEFAULT_ENDPOINT = 'https://api.remindops.com/v1/build/theme'; // To be replaced with accurate URL when building API

export async function fetchAndWriteLockfile(options: ToastOpsPluginOptions) {
  const apiKey = options.apiKey;
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  const cwd = process.cwd();
  const lockfilePath = path.join(cwd, 'toastops.lock.json');
  const outputDir = path.join(cwd, '.toastops');
  const cssOutputPath = path.join(outputDir, 'theme.css');

  if (!apiKey) {
    throw new Error('[ToastOps] FATAL: TOASTOPS_API_KEY is required in your build config.');
  }

  // Ensure output dir exists explicitly
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let themeData: { customCss: string; configJson: any } | null = null;

  if (!options.silent) {
    console.log('[ToastOps] Fetching AI Toast themes uniquely compiled for your API key...');
  }

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // Timeout explicitly to 5 seconds to not hang builds forever
      signal: AbortSignal.timeout(5000), 
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}: ${res.statusText}`);
    }

    themeData = await res.json();

    // 1. Write the payload to the lockfile for resilience against future API downtime
    fs.writeFileSync(lockfilePath, JSON.stringify(themeData, null, 2), 'utf-8');
    
    if (!options.silent) {
      console.log('✅ [ToastOps] Successfully downloaded AI theme and wrote toastops.lock.json.');
    }

  } catch (error: any) {
    console.error(`⚠️ [ToastOps ERR] Failed to fetch theme from RemindOps API: ${error.message}`);
    
    // 2. Fallback to reading the lockfile if explicitly fetching failed
    if (fs.existsSync(lockfilePath)) {
      console.warn(`⚠️ [ToastOps WARN] API unreachable. Falling back to cached toastops.lock.json...`);
      try {
        const lockfileContent = fs.readFileSync(lockfilePath, 'utf-8');
        themeData = JSON.parse(lockfileContent);
        console.warn('✅ [ToastOps] Successfully restored theme from lockfile.');
      } catch (parseError) {
        throw new Error(`[ToastOps] FATAL: Lockfile is corrupted and API is unreachable.`);
      }
    } else {
      throw new Error(`[ToastOps] FATAL: API unreachable and no toastops.lock.json exists. Build failed.`);
    }
  }

  // 3. Write the actual CSS to the `.toastops/theme.css` so the user can import it literally
  if (themeData?.customCss) {
    fs.writeFileSync(cssOutputPath, themeData.customCss, 'utf-8');
    if (!options.silent) {
      console.log(`✅ [ToastOps] Generated ${cssOutputPath}. Please import it into your app root: import '.toastops/theme.css';`);
    }
  } else {
    // Write an empty CSS file explicitly so it doesn't crash user imports if there's no custom CSS
    fs.writeFileSync(cssOutputPath, '/* No custom ToastOps AI theme configured */', 'utf-8');
  }

  return themeData;
}
