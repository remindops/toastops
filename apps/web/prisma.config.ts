import { defineConfig } from '@prisma/config'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// Force load .env.local for Prisma CLI execution in production
for (const p of ['.env.local', '../../.env.local']) {
  const envPath = path.resolve(process.cwd(), p)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true })
    break
  }
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL
  }
})
