import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const parent = path.resolve(process.cwd(), "..");
  const env = loadEnv(mode, parent);

  return {
    plugins: [react()],
    envDir: "../.env",
    server: {
      proxy: {
        "/api": {
          target: `http://${env.VITE_PROXY_HOST}:${env.VITE_PROXY_PORT}`,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
