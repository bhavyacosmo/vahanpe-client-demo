/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0D7CFA', // Vahan Blue
                'primary-light': '#7CB9FF', // Blue Light
                'primary-dark': '#053469', // Blue Dark
                secondary: '#1CD9EA', // Vahan Cyan
                'dark-400': '#30353E', // Dark 400
            }
        },
    },
    plugins: [],
}
