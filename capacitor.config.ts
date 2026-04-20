hereimport { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foxsd.offlintranslator',
  appName: 'Fox Translator',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'], // تسمح للمحرك بالاتصال بمصادر الـ WASM الخارجية عند الضرورة
    cleartext: true // تضمن عدم حجب البيانات المحملة من الإنترنت في المرة الأولى
  },
  android: {
    allowMixedContent: true, // ضرورية لعمل المكتبات الخارجية التي تعتمد على محركات ويب مختلفة
  }
};

export default config;
