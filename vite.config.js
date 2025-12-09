import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
})

// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}"
//   ],
//   theme: {
//     extend: {
//       colors: {
//         brand: {
//           50: "#f6fbf9",
//           100: "#e8f6ef",
//           500: "#0ea5a4"
//         }
//       },
//       spacing: {
//         18: "4.5rem"
//       }
//     },
//   },
//   plugins: [],
// }

