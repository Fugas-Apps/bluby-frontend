import { drizzle } from 'drizzle-orm/d1';
import { schema } from './schema';

export async function getDb(env: any) {
    return drizzle(env.DB, {
        schema,
        logger: true,
    });
}