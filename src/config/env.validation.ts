import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server configuration
  PORT: z.string().transform(Number).default('3000'),
  
  // Auth0 configuration
  AUTH0_DOMAIN: z.string().min(1, 'Auth0 domain is required'),
  AUTH0_CLIENT_ID: z.string().min(1, 'Auth0 client ID is required'),
  AUTH0_CLIENT_SECRET: z.string().min(1, 'Auth0 client secret is required'),
  AUTH0_CALLBACK_URL: z.string().url('Invalid Auth0 callback URL'),
  
  // Frontend URL
  FRONTEND_URL: z.string().url('Invalid frontend URL'),
  
  // Database URL
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // Service URLs
  DOCUMENT_SERVICE_URL: z.string().url('Invalid document service URL'),
  SCAN_SERVICE_URL: z.string().url('Invalid scan service URL'),
  VISA_COMPLIANCE_SERVICE_URL: z.string().url('Invalid visa compliance service URL'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    throw new Error(
      'Invalid environment variables:\n' +
      errors.map(err => `${err.path}: ${err.message}`).join('\n')
    );
  }
  
  return result.data;
} 