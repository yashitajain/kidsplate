import { NextRequest, NextResponse } from 'next/server'

function getBackendUrl(path: string) {
  const base = (process.env.PYTHON_BACKEND_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export async function proxyToPython(
  request: NextRequest,
  path: string,
  options?: {
    userId?: string | null
  }
) {
  const url = new URL(getBackendUrl(path))
  const incomingUrl = new URL(request.url)
  url.search = incomingUrl.search

  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  if (options?.userId) headers.set('x-user-id', options.userId)

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text()
  }

  const response = await fetch(url, init)
  const text = await response.text()

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  })
}
