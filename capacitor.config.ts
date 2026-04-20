import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foxsd.offlintranslator',
  appName: 'Fox Translator',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'],
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
