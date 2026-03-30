// vite.config.js
import { defineConfig } from "file:///F:/laragon/www/cabinet/project/node_modules/vite/dist/node/index.js";
import laravel from "file:///F:/laragon/www/cabinet/project/node_modules/laravel-vite-plugin/dist/index.js";
import react from "file:///F:/laragon/www/cabinet/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    laravel({
      input: "resources/js/app.tsx",
      refresh: true
    }),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/resources/js/i18n.ts") || id.includes("/resources/js/locales/")) {
            return "i18n";
          }
          if (!id.includes("node_modules")) {
            return void 0;
          }
          if (id.includes("@inertiajs") || id.includes("ziggy-js")) {
            return "inertia";
          }
          if (id.includes("react-bootstrap") || id.includes("@restart") || id.includes("react-overlays")) {
            return "ui-kit";
          }
          if (id.includes("i18next") || id.includes("react-i18next")) {
            return "i18n";
          }
          if (id.includes("bootstrap")) {
            return "bootstrap";
          }
          if (id.includes("axios") || id.includes("laravel-echo") || id.includes("pusher-js")) {
            return "app-vendor";
          }
          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }
          return void 0;
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxjYWJpbmV0XFxcXHByb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGxhcmFnb25cXFxcd3d3XFxcXGNhYmluZXRcXFxccHJvamVjdFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovbGFyYWdvbi93d3cvY2FiaW5ldC9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgbGFyYXZlbCBmcm9tICdsYXJhdmVsLXZpdGUtcGx1Z2luJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW1xuICAgICAgICBsYXJhdmVsKHtcbiAgICAgICAgICAgIGlucHV0OiAncmVzb3VyY2VzL2pzL2FwcC50c3gnLFxuICAgICAgICAgICAgcmVmcmVzaDogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICAgIHJlYWN0KCksXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvcmVzb3VyY2VzL2pzL2kxOG4udHMnKSB8fCBpZC5pbmNsdWRlcygnL3Jlc291cmNlcy9qcy9sb2NhbGVzLycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2kxOG4nO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BpbmVydGlhanMnKSB8fCBpZC5pbmNsdWRlcygnemlnZ3ktanMnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdpbmVydGlhJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QtYm9vdHN0cmFwJykgfHwgaWQuaW5jbHVkZXMoJ0ByZXN0YXJ0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LW92ZXJsYXlzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAndWkta2l0JztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnaTE4bmV4dCcpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1pMThuZXh0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnaTE4bic7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2Jvb3RzdHJhcCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2Jvb3RzdHJhcCc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2F4aW9zJykgfHwgaWQuaW5jbHVkZXMoJ2xhcmF2ZWwtZWNobycpIHx8IGlkLmluY2x1ZGVzKCdwdXNoZXItanMnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhcHAtdmVuZG9yJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygnc2NoZWR1bGVyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAncmVhY3QtdmVuZG9yJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUixTQUFTLG9CQUFvQjtBQUNuVCxPQUFPLGFBQWE7QUFDcEIsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNKLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxJQUNiLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNWO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDSixhQUFhLElBQUk7QUFDYixjQUFJLEdBQUcsU0FBUyx1QkFBdUIsS0FBSyxHQUFHLFNBQVMsd0JBQXdCLEdBQUc7QUFDL0UsbUJBQU87QUFBQSxVQUNYO0FBRUEsY0FBSSxDQUFDLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDOUIsbUJBQU87QUFBQSxVQUNYO0FBRUEsY0FBSSxHQUFHLFNBQVMsWUFBWSxLQUFLLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDdEQsbUJBQU87QUFBQSxVQUNYO0FBRUEsY0FBSSxHQUFHLFNBQVMsaUJBQWlCLEtBQUssR0FBRyxTQUFTLFVBQVUsS0FBSyxHQUFHLFNBQVMsZ0JBQWdCLEdBQUc7QUFDNUYsbUJBQU87QUFBQSxVQUNYO0FBRUEsY0FBSSxHQUFHLFNBQVMsU0FBUyxLQUFLLEdBQUcsU0FBUyxlQUFlLEdBQUc7QUFDeEQsbUJBQU87QUFBQSxVQUNYO0FBRUEsY0FBSSxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQzFCLG1CQUFPO0FBQUEsVUFDWDtBQUVBLGNBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsY0FBYyxLQUFLLEdBQUcsU0FBUyxXQUFXLEdBQUc7QUFDakYsbUJBQU87QUFBQSxVQUNYO0FBRUEsY0FBSSxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxXQUFXLEdBQUc7QUFDbEQsbUJBQU87QUFBQSxVQUNYO0FBRUEsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
