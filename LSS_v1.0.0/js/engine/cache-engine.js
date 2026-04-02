export const CACHE_ENABLED = true   // Set to false to disable caching

const RAM = {}

export function getRam(key) {

    if (!CACHE_ENABLED) return null

    return RAM[key] || null

}

export function setRam(key, data) {

    if (!CACHE_ENABLED) return

    RAM[key] = data

}

export function getLocal(key, expiry = 86400000) {

    if (!CACHE_ENABLED) return null

    const raw = localStorage.getItem(key)

    if (!raw) return null

    let cache

    try {

        cache = JSON.parse(raw)

    } catch {

        return null

    }

    if (Date.now() - cache.time > expiry) {

        return null

    }

    RAM[key] = cache.data

    return cache.data

}

export function setLocal(key, data) {

    if (!CACHE_ENABLED) return

    localStorage.setItem(key, JSON.stringify({

        data: data,
        time: Date.now()

    }))

}