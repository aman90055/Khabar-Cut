export const revalidate = 3600;

export async function GET() {
  const rawId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
  // Strip 'ca-' if present to get pure pub-XXXXXXXXXXXXXXXX
  const pubId = rawId.replace(/^ca-/, '');

  const content = `# Khabar Cut News (khabarcut.in) - Official Authorized Digital Sellers (ads.txt)
google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
