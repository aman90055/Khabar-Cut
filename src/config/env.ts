import { z } from "zod";

const envSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Storage
  NEXT_PUBLIC_STORAGE_BUCKET: z.string().default("media"),
  NEXT_PUBLIC_AVATAR_BUCKET: z.string().default("avatars"),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // CDN / Cloudflare
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    const errors = Object.entries(formatted)
      .filter(([key]) => key !== "_errors")
      .map(([key, value]) => {
        const errorMessages =
          value && typeof value === "object" && "_errors" in value
            ? (value as { _errors: string[] })._errors.join(", ")
            : "Invalid value";
        return `  ${key}: ${errorMessages}`;
      })
      .join("\n");

    throw new Error(
      `❌ Invalid environment variables:\n${errors}\n\nPlease check your .env.local file.`
    );
  }

  return parsed.data;
}

export const env = validateEnv();

// Type-safe public env (safe for client-side)
export const publicEnv = {
  appUrl: env.NEXT_PUBLIC_APP_URL,
  appName: env.NEXT_PUBLIC_APP_NAME,
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  storageBucket: env.NEXT_PUBLIC_STORAGE_BUCKET,
  avatarBucket: env.NEXT_PUBLIC_AVATAR_BUCKET,
  cdnUrl: env.NEXT_PUBLIC_CDN_URL,
  gaMeasurementId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;

// Server-only env (never exposed to client)
export const serverEnv = {
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  databaseUrl: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
  nextAuthSecret: env.NEXTAUTH_SECRET,
  googleClientId: env.GOOGLE_CLIENT_ID,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  logLevel: env.LOG_LEVEL,
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },
  cloudflare: {
    zoneId: env.CLOUDFLARE_ZONE_ID,
    apiToken: env.CLOUDFLARE_API_TOKEN,
  },
  sentry: {
    dsn: env.SENTRY_DSN,
    authToken: env.SENTRY_AUTH_TOKEN,
  },
} as const;
