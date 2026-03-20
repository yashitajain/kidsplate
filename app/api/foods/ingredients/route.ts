import { NextRequest } from 'next/server'
import { proxyToPython } from '@/lib/python-backend'

export async function GET(request: NextRequest) {
  return proxyToPython(request, '/foods/ingredients')
}
