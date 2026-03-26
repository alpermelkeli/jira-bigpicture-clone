/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        epic: '#6B46C1',
        story: '#0052CC',
        task: '#0065FF',
        subtask: '#0052CC',
        bug: '#DE350B',
      },
    },
  },
  plugins: [],
}

