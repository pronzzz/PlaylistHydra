import { useCallback } from 'react'

const DB_NAME = 'PlaylistHydra'
const DB_VERSION = 1
const STORE_NAME = 'sessions'

/**
 * Opens/creates the IndexedDB database
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

/**
 * Hook for persisting and restoring download session state via IndexedDB.
 */
export function useIndexedDB() {
    const saveSession = useCallback(async (key, data) => {
        try {
            const db = await openDB()
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            store.put({ ...data, savedAt: Date.now() }, key)
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve
                tx.onerror = reject
            })
        } catch (err) {
            console.warn('IndexedDB save failed:', err)
        }
    }, [])

    const loadSession = useCallback(async (key) => {
        try {
            const db = await openDB()
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.get(key)
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result || null)
                request.onerror = () => reject(request.error)
            })
        } catch (err) {
            console.warn('IndexedDB load failed:', err)
            return null
        }
    }, [])

    const clearSession = useCallback(async (key) => {
        try {
            const db = await openDB()
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            store.delete(key)
        } catch (err) {
            console.warn('IndexedDB clear failed:', err)
        }
    }, [])

    return { saveSession, loadSession, clearSession }
}
