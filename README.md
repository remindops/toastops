# ToastOps AI Notification Platform (Beta)

Welcome to the **ToastOps** platform, an advanced Custom Notification infrastructure explicitly supporting BYOK (Bring-Your-Own-Key) AI Theme generation, pure TypeScript observer patterns, and Enterprise KMS key integrations.

This repository is built as a highly performant **Next.js Fullstack Monorepo**, encompassing both the client-facing library and the overarching dashboard.

## Monorepo Architecture

1. **`apps/web` (Next.js Monolithic Stack)**
   The core API backend and user-facing dashboard natively deployed to Vercel.
   - Handles DIY Authentication (PBKDF2/jose).
   - Secures AI API keys via AES-256-GCM Enterprise KMS Wrappers.
   - Natively proxies OpenAI, Anthropic, and Gemini models explicitly bypassing implicit SDKs.
   - Provides an AI Toast Architect builder for realtime CSS testing.

2. **`packages/toastops` (NPM Client Library)**
   The pure TypeScript core and React package consumed by end-users.
   - Contains a zero-latency `toastops.lock.json` caching mechanism for Vite and Next.js bundlers.
   - Uses an explicit observer system for maximum performance without React Context.

## Getting Started

### Prerequisites

- You must have [Bun](https://bun.sh/) installed locally for fast dependency resolution.
- A PostgreSQL connection string (Supabase, Neon, or local).

### Installation & Local Development

1. **Install dependencies from the root:**

   ```bash
   bun install
   ```

2. **Configure Environment Variables:**
   Navigate into `apps/web` and create an `.env` file based on `.env.example`:

   ```bash
   cd apps/web
   cp .env.example .env
   ```

   Fill in your `DATABASE_URL` and a random 32-character `ENCRYPTION_SECRET`.

3. **Database Setup:**
   Generate the Prisma client and push your PostgreSQL schema:

   ```bash
   bun x prisma generate
   bun x prisma db push
   ```

4. **Running the Platform:**
   Start the Next.js unified stack.
   ```bash
   npm run dev
   ```
   The dashboard and the API endpoints will become available at `http://localhost:3000`.

## Deployment

The entire stack is natively optimized for **Vercel**.

1. Connect this repository to Vercel.
2. Set the Root Directory strictly to `apps/web`.
3. Provide your `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, and `ENCRYPTION_SECRET` as Environment Variables.
4. Deploy.

## License

This project is open-source under the MIT License.
