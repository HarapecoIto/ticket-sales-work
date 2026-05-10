declare namespace NodeJS {
  interface ProcessEnv {
    readonly CHANNEL_ACCESS_TOKEN: string;
    readonly CHANNEL_SECRET: string;
    readonly CRON_SECRET: string;
    readonly LINE_PUSH_TO: string | undefined;
    readonly LINE_PUSH_MESSAGE: string | undefined;
    readonly PORT: string | undefined;
    readonly ENVIRONMENT: string;
    readonly DOMAIN_NAME: string;
  }
}
