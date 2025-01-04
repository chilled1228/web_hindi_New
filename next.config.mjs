/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  },
  server: {
    https: {
      key: './.cert/key.pem',
      cert: './.cert/cert.pem',
    },
  },
};

export default nextConfig;
