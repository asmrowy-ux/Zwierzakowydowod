let handlerInstance: any = null;

export default {
  async fetch(request: any, env: any, ctx: any) {
    console.log("Worker fetch handler invoked");
    console.log("Worker env keys:", Object.keys(env || {}));
    
    // Define process.env directly on the original process object using Object.defineProperty.
    // This preserves Cloudflare nodejs_compat built-ins and ensures property descriptors are correct.
    const originalProcess = (globalThis as any).process || {};
    const customEnv = {
      DATABASE_URL: env.DATABASE_URL,
      DIRECT_URL: env.DIRECT_URL,
      JWT_SECRET: env.JWT_SECRET,
      JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
      IS_WORKER: 'true',
      NODE_ENV: 'production'
    };

    try {
      Object.defineProperty(originalProcess, 'env', {
        get() {
          return customEnv;
        },
        set(value) {
          Object.assign(customEnv, value);
        },
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      console.warn("Could not define process.env property:", e);
    }
    
    (globalThis as any).DATABASE_URL = env.DATABASE_URL;
    (globalThis as any).DIRECT_URL = env.DIRECT_URL;

    // Lazily import and initialize app after env variables are populated in globalThis.process.env
    if (!handlerInstance) {
      console.log("First request: dynamically importing and initializing app...");
      // @ts-ignore
      const { httpServerHandler } = await import('cloudflare:node');
      const { default: app } = await import('./index');
      const { createServer } = await import('node:http');

      const server = createServer(app);
      handlerInstance = httpServerHandler(server);
      console.log("App initialization complete.");
    }

    return handlerInstance.fetch(request, env, ctx);
  }
};
