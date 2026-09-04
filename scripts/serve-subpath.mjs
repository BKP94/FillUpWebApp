// Read-only local test host emulating a GitHub Pages repository URL.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const root = resolve('dist')
const prefix = '/FillUpWebApp/'
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
}
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname)
    if (!pathname.startsWith(prefix)) {
      response.writeHead(404).end()
      return
    }
    const file = resolve(root, pathname.slice(prefix.length) || 'index.html')
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end()
      return
    }
    const body = await readFile(file)
    response.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    })
    response.end(body)
  } catch {
    response.writeHead(404).end()
  }
}).listen(4174, '127.0.0.1')
