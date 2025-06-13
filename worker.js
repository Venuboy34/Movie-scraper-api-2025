import { parse } from 'node-html-parser'

export default {
  async fetch(request) {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname === '/search') {
      const query = searchParams.get('query')
      if (!query) return json({ error: 'Missing query' }, 400)

      const res = await fetch(`https://netnaija.xyz/?s=${encodeURIComponent(query)}`)
      const html = await res.text()
      const root = parse(html)

      const results = root.querySelectorAll('article').map(article => {
        const title = article.querySelector('h2 a')?.text.trim()
        const url = article.querySelector('h2 a')?.getAttribute('href')
        const thumb = article.querySelector('img')?.getAttribute('src')
        return { title, url, thumb }
      }).slice(0, 6)

      return json(results)
    }

    if (pathname === '/download') {
      const movieUrl = searchParams.get('url')
      if (!movieUrl) return json({ error: 'Missing URL' }, 400)

      const res = await fetch(movieUrl)
      const html = await res.text()
      const root = parse(html)

      const links = root.querySelectorAll('a')
      const validExtensions = ['.mkv', '.mp4', '.lol', '.avi', '.mov']

      const fileLinks = links
        .map(link => {
          const href = link.getAttribute('href')
          if (href && validExtensions.some(ext => href.toLowerCase().includes(ext))) {
            return {
              text: link.text.trim() || href,
              url: href
            }
          }
          return null
        })
        .filter(Boolean)

      return json(fileLinks)
    }

    return json({ error: 'Not Found' }, 404)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
