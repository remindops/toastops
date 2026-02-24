const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())
console.log(process.env.DATABASE_URL)
