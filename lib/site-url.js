export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {}
  }
  const deploymentHost = process.env.VERCEL_URL;
  return deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000";
}
