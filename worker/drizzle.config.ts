import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: 'cf600ae4-f3fc-474f-9291-689997832ad4',
    token: process.env.CLOUDFLARE_API_TOKEN!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  },
});
