const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const { defineConfig } = require('drizzle-kit')

module.exports = defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.VITE_DATABASE_URL,
  },
})
