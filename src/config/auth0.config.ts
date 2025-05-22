import { registerAs } from '@nestjs/config';
import { EnvConfig } from './env.validation';

export default registerAs('auth0', () => {
  const config = process.env as unknown as EnvConfig;
  return {
    domain: config.AUTH0_DOMAIN,
    clientId: config.AUTH0_CLIENT_ID,
    clientSecret: config.AUTH0_CLIENT_SECRET,
    callbackURL: config.AUTH0_CALLBACK_URL,
    issuer: `https://${config.AUTH0_DOMAIN}/`,
  };
});