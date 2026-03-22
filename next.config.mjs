/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['tesseract.js'],
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/tesseract.js/dist/worker-script/node/index.js',
      ],
    },
  },
}

export default nextConfig
