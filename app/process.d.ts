declare namespace NodeJS {
  interface ProcessEnv {
    readonly VERCEL_ENV: 'production' | 'preview' | 'development' | undefined;
    readonly CIEL_ID: string;
    readonly CIEL_API_SECRET: string;
    readonly CRON_SECRET: string;
    readonly CHANNEL_ACCESS_TOKEN: string;
    readonly CHANNEL_SECRET: string;
    readonly CHANNEL_ACCESS_TOKEN_V2: string;
    readonly CHANNEL_SECRET_V2: string;
    readonly ASANA_ACCESS_TOKEN: string;
  }
}
