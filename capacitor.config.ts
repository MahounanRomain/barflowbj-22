
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.eb5072a435de4a66913bae5eb7b8d00c',
  appName: 'BarFlow',
  webDir: 'dist',
  server: {
    url: "https://eb5072a4-35de-4a66-913b-ae5eb7b8d00c.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    ScreenOrientation: {
      orientations: ["portrait", "landscape", "landscape-primary", "landscape-secondary"]
    }
  },
  bundledWebRuntime: false
};

export default config;
