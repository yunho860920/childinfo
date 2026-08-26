import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'myfirstinfantcare',
  outdir: 'dist-ait',
  brand: {
    displayName: '초보아빠화이팅',
    primaryColor: '#F04452',
    icon: 'https://static.toss.im/appsintoss/42797/93c7e93e-b85f-4982-bcb0-01a9a06ba64d.png',
  },
  permissions: [
    { name: 'geolocation', access: 'access' },
  ],
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'npm run build:ait:web',
    },
  },
  webViewProps: {
    type: 'partner',
    bounces: true,
    pullToRefreshEnabled: false,
    allowsInlineMediaPlayback: true,
  },
});
