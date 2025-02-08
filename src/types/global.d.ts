declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WEBHOOK_URL: string | undefined;
      BARK_SERVER_URL: string | undefined;
      BARK_DEVICE_KEY: string | undefined;
    }
  }
}

export {};