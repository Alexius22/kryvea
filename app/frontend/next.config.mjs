/**
 * @type {import('next').NextConfig}
 */
 const nextConfig = {
  async redirects() {
    return [
      {
          source: '/',
          destination: '/',
          basePath: false,
          permanent: false
      }
    ]
  },
}

export default nextConfig