import serverless from 'serverless-http';
import app from './index';

const handler = serverless(app);

export default {
  async fetch(request: any, env: any, ctx: any) {
    // Map Cloudflare environment secrets to process.env at runtime
    if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;
    if (env.DIRECT_URL) process.env.DIRECT_URL = env.DIRECT_URL;
    if (env.JWT_SECRET) process.env.JWT_SECRET = env.JWT_SECRET;
    if (env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
    
    process.env.NODE_ENV = 'production';

    return handler(request, ctx);
  }
};
