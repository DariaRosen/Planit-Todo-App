const defaultApiBaseUrl = "http://localhost:4000/api"

const apiBaseUrl =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL
        : defaultApiBaseUrl

export const buildApiUrl = (path = "") => {
    if (!path) {
        return apiBaseUrl
    }

    return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export { apiBaseUrl }

