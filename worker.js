export default {
  async fetch(request) {
    const { pathname, searchParams } = new URL(request.url);

    if (pathname === '/search') {
      const query = searchParams.get('query');
      if (!query) return json({ error: 'Missing query' }, 400);

      const res = await fetch(`https://netnaija.xyz/?s=${encodeURIComponent(query)}`);
      const html = await res.text();

      const results = [...html.matchAll(/<article.*?<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>[\s\S]*?<img[^>]+src="([^"]+)"/g)]
        .map(match => ({
          url: match[1],
          title: stripHTML(match[2]),
          thumb: match[3],
        }))
        .slice(0, 6);

      return json(results);
    }

    if (pathname === '/download') {
      const url = searchParams.get('url');
      if (!url) return json({ error: 'Missing URL' }, 400);

      const res = await fetch(url);
      const html = await res.text();

      const links = [...html.matchAll(/<a[^>]+href="([^"]+\.(mkv|mp4|lol|avi|mov)[^"]*)".*?>(.*?)<\/a>/gi)]
        .map(match => ({
          url: match[1],
          text: stripHTML(match[3] || match[1])
        }));

      return json(links);
    }

    return json({ error: 'Not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function stripHTML(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}
