declare namespace NodeJS {
  interface ProcessEnv {
    readonly CHANNEL_ACCESS_TOKEN: string;
    readonly CHANNEL_SECRET: string;
    readonly CRON_SECRET: string;
    readonly VERCEL_ENV: 'production' | 'preview' | 'development' | undefined;
    readonly SPREADSHEETS_API_KEY: string;
  }
}
