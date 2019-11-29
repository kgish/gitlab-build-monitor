import { environment } from '../../../environments/environment';

export interface AuthConfig {
  issuer: string;
  redirectUri: string;
  clientId: string;
  scope: string;
}

export const authConfig: AuthConfig = {
  issuer: 'https://gitlab.com/oauth/authorize',
  redirectUri: window.location.origin + environment.env.redirecturl,
  clientId: '3a27b6f126662a5d5fb24cdba99c5a7746834ceff168a85311e8424e77cbbbd9',
  scope: 'openid api'
};
