import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  console.log("getPrisma() invoked");
  console.log("process.env.IS_WORKER:", process.env.IS_WORKER);
  console.log("globalThis.DATABASE_URL:", (globalThis as any).DATABASE_URL);
  console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL);
  console.log("WebSocket in globalThis:", typeof globalThis !== 'undefined' && 'WebSocket' in globalThis);
  console.log("process in globalThis:", typeof globalThis !== 'undefined' && 'process' in globalThis);

  if (prismaInstance) return prismaInstance;

  if (process.env.IS_WORKER === 'true' || (typeof globalThis !== 'undefined' && 'WebSocket' in globalThis && !('process' in globalThis))) {
    console.log("Initializing Prisma Neon serverless adapter in HTTP mode...");
    const connectionString = (globalThis as any).DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in environment variables");
    }
    const adapter = new PrismaNeonHTTP(connectionString, {});

    prismaInstance = new PrismaClient({
      adapter,
      log: ['error'],
    });
  } else {
    console.log("Initializing standard Prisma Client...");
    // Use standard Prisma Client in local Node.js or other environments
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
      });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  }

  return prismaInstance;
}

// Export a proxy that delegates to the lazy prisma instance
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export default prisma;
