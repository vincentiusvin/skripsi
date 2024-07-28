import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: "../.env",
  server: {
    proxy: {
      "/api": {
        target: `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
