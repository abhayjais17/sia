/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      // Add the deployed signaling WebSocket origin to connect-src when the Worker is integrated.
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self' blob: https://*.googleapis.com https://*.cloudflare.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" },
    ] }]
  },
  images: { unoptimized: true },
}
export default nextConfig
