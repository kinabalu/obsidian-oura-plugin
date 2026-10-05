import {requestUrl, RequestUrlResponse} from 'obsidian';
import {OuraPluginSettings} from './types';

export const OAUTH_CALLBACK = 'oura-oauth';
export const DEFAULT_REDIRECT_URI = `obsidian://${OAUTH_CALLBACK}`;

// Each plugin instance owns one refresh operation: Oura refresh tokens are single-use.
export class OuraOAuth {
  private pending: {state: string; expiresAt: number; clientId: string; clientSecret: string; redirectUri: string} | null = null;
  private refresh: Promise<string> | null = null;
  private generation = 0;
  private signInGeneration = 0;

  constructor(private settings: OuraPluginSettings, private save: () => Promise<void>) {}

  authorize(): string {
    const {clientId, clientSecret, redirectUri} = this.settings;
    if (!clientId || !clientSecret) {
      throw new Error('Enter your Oura client ID, client secret, and registered redirect URI first.');
    }
    this.redirectUrl();
    const state = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
    this.signInGeneration++;
    this.pending = {state, expiresAt: Date.now() + 10 * 60 * 1000, clientId, clientSecret, redirectUri};
    return `https://cloud.ouraring.com/oauth/authorize?${new URLSearchParams({
      response_type: 'code', client_id: clientId, redirect_uri: redirectUri, scope: 'daily', state,
    })}`;
  }

  async complete(params: Record<string, string>): Promise<void> {
    const pending = this.pending;
    if (!pending || params.state !== pending.state || Date.now() >= pending.expiresAt) {
      throw new Error('Oura sign-in expired or did not match this vault. Start Connect to Oura again.');
    }
    this.pending = null;
    if (params.error) throw new Error('Oura authorization was denied. Start Connect to Oura again.');
    if (!params.code) throw new Error('Oura did not return an authorization code.');
    if (params.scope !== undefined && !params.scope.split(' ').includes('daily')) {
      throw new Error('Daily data access is required. Reconnect and allow daily data access.');
    }
    if (pending.clientId !== this.settings.clientId || pending.clientSecret !== this.settings.clientSecret || pending.redirectUri !== this.settings.redirectUri) {
      throw new Error('Oura settings changed during sign-in. Start Connect to Oura again.');
    }
    const generation = this.generation;
    const signInGeneration = this.signInGeneration;
    // Preserve an in-flight rotation before replacing the connection with a new grant.
    if (this.refresh !== null) await this.refresh.catch(() => {});
    if (generation !== this.generation || signInGeneration !== this.signInGeneration) {
      throw new Error('Oura connection changed. Please connect again.');
    }
    await this.exchange({grant_type: 'authorization_code', code: params.code, redirect_uri: pending.redirectUri}, signInGeneration);
  }

  async completeUrl(value: string): Promise<void> {
    let url: URL;
    try { url = new URL(value.trim()); } catch { throw new Error('Paste the complete redirect URL from your browser.'); }
    const expected = this.redirectUrl();
    if (url.protocol !== expected.protocol || url.host !== expected.host || url.pathname !== expected.pathname) {
      throw new Error('The callback URL does not match your registered redirect URI.');
    }
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => { params[key] = value; });
    await this.complete(params);
  }

  private redirectUrl(): URL {
    const message = 'Enter a valid redirect URI: obsidian://oura-oauth or an HTTPS URL you control, matching your Oura application settings.';
    let uri: URL;
    try {
      uri = new URL(this.settings.redirectUri);
    } catch {
      throw new Error(message);
    }
    if (this.settings.redirectUri !== DEFAULT_REDIRECT_URI && uri.protocol !== 'https:') {
      throw new Error(message);
    }
    return uri;
  }

  async disconnect(): Promise<void> {
    this.generation++;
    this.pending = null;
    this.settings.oauthTokens = null;
    delete this.settings.personalAccessToken;
    await this.save();
  }

  cancel(): void {
    this.signInGeneration++;
    this.pending = null;
  }

  async accessToken(rejectedToken?: string): Promise<string> {
    const tokens = this.settings.oauthTokens;
    if (!tokens) throw new Error('Connect to Oura in the plugin settings first.');
    if (tokens.expiresAt > Date.now() + 60_000 && tokens.accessToken !== rejectedToken) return tokens.accessToken;
    if (this.refresh === null) {
      this.refresh = this.exchange({grant_type: 'refresh_token', refresh_token: tokens.refreshToken})
        .finally(() => { this.refresh = null; });
    }
    return this.refresh;
  }

  async request(url: string): Promise<RequestUrlResponse> {
    const useOAuth = !!this.settings.oauthTokens;
    let token = useOAuth ? await this.accessToken() : this.settings.personalAccessToken;
    if (!token) throw new Error('Connect to Oura in the plugin settings first.');
    const send = async () => {
      try { return await requestUrl({url, headers: {Authorization: `Bearer ${token}`}, throw: false}); }
      catch { throw new Error('Could not reach Oura. Check your connection and try again.'); }
    };
    let response = await send();
    if (response.status === 401 && useOAuth) {
      token = await this.accessToken(token);
      response = await send();
    }
    if (response.status === 401) throw new Error('Oura authorization was rejected. Reconnect in the plugin settings.');
    if (response.status === 403) throw new Error('Oura denied data access. Reconnect and allow daily data access.');
    if (response.status >= 400) throw new Error(`Oura request failed (HTTP ${response.status}). Try again later.`);
    return response;
  }

  private async exchange(parameters: Record<string, string>, signInGeneration?: number): Promise<string> {
    const generation = this.generation;
    let response: RequestUrlResponse;
    try {
      response = await requestUrl({
        url: 'https://api.ouraring.com/oauth/token', method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        body: new URLSearchParams({...parameters, client_id: this.settings.clientId, client_secret: this.settings.clientSecret}).toString(),
        throw: false,
      });
    } catch { throw new Error('Could not reach Oura. Check your connection and try again.'); }
    if (generation !== this.generation || (signInGeneration !== undefined && signInGeneration !== this.signInGeneration)) throw new Error('Oura connection changed. Please connect again.');
    if (response.status >= 400) {
      let errorCode: unknown;
      try { errorCode = response.json?.error; } catch { /* Non-JSON errors must preserve the connection. */ }
      if (parameters.grant_type === 'refresh_token' &&
          (response.status === 400 || response.status === 401) && errorCode === 'invalid_grant') {
        this.settings.oauthTokens = null;
        await this.save();
      }
      throw new Error(response.status === 400 || response.status === 401
        ? 'Oura authorization expired or credentials were rejected. Check settings and reconnect.'
        : `Oura sign-in failed (HTTP ${response.status}). Try again later.`);
    }
    const data = response.json;
    if (!data || typeof data.access_token !== 'string' || !data.access_token ||
        typeof data.refresh_token !== 'string' || !data.refresh_token ||
        typeof data.token_type !== 'string' || data.token_type.toLowerCase() !== 'bearer' ||
        typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) || data.expires_in <= 0) {
      throw new Error('Oura returned an invalid token response. Please reconnect.');
    }
    this.settings.oauthTokens = {
      accessToken: data.access_token, refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    delete this.settings.personalAccessToken;
    await this.save();
    return data.access_token;
  }
}
