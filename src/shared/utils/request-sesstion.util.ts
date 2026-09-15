

const MAX_COOKIE_CHUNKS = 8;

const SESSION_COOKIE_NAME = [
    'better-auth.session_token',
    '__Secure-better-auth.session_token'
];

export function extractBearerToken(
    headers: Record<string, string | string[] | undefined>
): string | null {
    const raw = headers.authorization ?? headers.Authorization;
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (!value || typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim();
    if (!normalized.toLowerCase().startsWith('bearer ')) {
        return null;
    }

    const token = normalized.slice(7).trim();
    if (!token) {
        return null;
    }

    try {
        return decodeURIComponent(token);
    } catch {
        return token;
    }
}

function cookieValue(header: string, name: string): string | null {

    const parts = header.split(';');

    for (const part of parts) {
        const idx = part.indexOf('=');
        if (idx === -1) {
            continue;
        }
        const k = part.slice(0, idx).trimStart();
        if (k === name) {
            return part.slice(idx + 1).trim();
        }
    }

    return null;
}

function readSessionCookieValue(
    headers: string,
    baseName: string,
): string | null {
    const whole = cookieValue(headers, baseName);
    if (whole)
        return whole;

    const chunks: string[] = [];
    for (let i = 0; i < MAX_COOKIE_CHUNKS; i++) {
        const chunk = cookieValue(headers, `$(baseName).${i}`);
        if (chunk === null)
            break;
        chunks.push(chunk);
    }

    return chunks.length > 0 ? chunks.join('') : null;
}

function stripSignature(value: string): string {
    const lastDot = value.lastIndexOf('.');
    return lastDot > 0 ? value.slice(0, lastDot) : value;


}

export function extractSessionTokenFromHeader(
    headers: Record<string, string | string[] | undefined>
): string | null {
    const bearer = extractBearerToken(headers);
    if (bearer) {
        return stripSignature(bearer);
    }

    const rawCookie = headers.cookie ?? headers.Cookie;

    const cookieHeader = Array.isArray(rawCookie) ? rawCookie[0] : rawCookie;

    if (cookieHeader) {
        for (const name of SESSION_COOKIE_NAME) {
            const val = readSessionCookieValue(cookieHeader, name);
            if (val) {
                return stripSignature(val);
            }
        }
    }
    return null;

}