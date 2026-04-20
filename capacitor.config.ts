import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foxsd.offlintranslator',
  appName: 'مترجم 𝐹𝑜𝑥 أوفلاين',
  webDir: 'dist',
  server: {
    url: 'https://824687f0-08dd-4c3a-ba37-9eb55830cbed.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
