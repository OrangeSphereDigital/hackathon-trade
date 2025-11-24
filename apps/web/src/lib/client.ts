// client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '../../../server'
import { env } from '@/constants/env'

export const client = treaty<App>(env.SERVER_URL)