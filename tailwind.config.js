/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Agar future mein humein custom colors ya fonts add karne honge,
      // toh hum unhein yahan define karenge.
      // Filhal ke liye, humne jo arbitrary values use ki hain (jaise bg-[#F5F3FF])
      // wo bina iske bhi chal jayengi.
    },
  },
  plugins: [],
}