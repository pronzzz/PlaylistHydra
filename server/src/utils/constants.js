import path from 'path'

export const MAX_PLAYLIST_SIZE = 1000
export const DEFAULT_BATCH_SIZE = 50
export const MAX_RETRIES = 3
export const MAX_CONCURRENT_DOWNLOADS = 3
export const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.resolve('downloads')
