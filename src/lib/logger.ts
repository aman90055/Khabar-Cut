import pino from 'pino';

const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || 'info';

const isBrowser = typeof window !== 'undefined';

const baseConfig = {
  level: logLevel,
  browser: isBrowser ? { asObject: true } : undefined,
  base: {
    env,
    service: 'khabar-cut',
  },
};

export const appLogger = pino({
  ...baseConfig,
  name: 'app',
});

export const securityLogger = pino({
  ...baseConfig,
  name: 'security',
});

export const performanceLogger = pino({
  ...baseConfig,
  name: 'performance',
});

export const auditLogger = pino({
  ...baseConfig,
  name: 'audit',
});
