import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kidsbite.app',
  appName: 'KidsPlate',
  webDir: 'www',
  server: {
    url: 'https://kidsplate.vercel.app',
    cleartext: false,
  },
};

export default config;
