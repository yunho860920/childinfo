import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'myfirstinfantcare',
  outdir: 'dist',
  brand: {
    displayName: 'ChildInfo',
    primaryColor: '#F04452',
    icon: './public/logo.png',
  },
  permissions: [
    { name: 'geolocation', access: 'access' },
  ],
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  webViewProps: {
    type: 'partner',
    bounces: true,
    pullToRefreshEnabled: false,
    allowsInlineMediaPlayback: true,
  },
});
