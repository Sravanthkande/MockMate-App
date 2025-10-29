/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify all file types that use Tailwind classes
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Define a custom font that uses the Inter font family
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Define a primary color based on your brand (e.g., Indigo)
        primary: {
          500: '#6366f1', // Indigo 500
          600: '#4f46e5', // Indigo 600
        }
      }
    },
  },
  plugins: [],
}
