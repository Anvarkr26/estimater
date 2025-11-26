import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bashabedmart.estimator',
  appName: 'Basha Bed Mart Estimator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
