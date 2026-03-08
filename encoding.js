/**
 * Pure encoding/decoding logic - testable in Node and used by app.js in the browser.
 */

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE62_BASE = 62n;
const BASE256 = 256n;
const base62CharMap = new Map(
    [...BASE62_ALPHABET].map((char, index) => [char, BigInt(index)])
);
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

export function encodeBase62(text) {
    const bytes = utf8Encoder.encode(String(text));
    if (bytes.length === 0) {
        return '';
    }

    let leadingZeroCount = 0;
    while (leadingZeroCount < bytes.length && bytes[leadingZeroCount] === 0) {
        leadingZeroCount++;
    }

    if (leadingZeroCount === bytes.length) {
        return BASE62_ALPHABET[0].repeat(leadingZeroCount);
    }

    let value = 0n;
    for (let i = leadingZeroCount; i < bytes.length; i++) {
        value = (value * BASE256) + BigInt(bytes[i]);
    }

    let encoded = '';
    while (value > 0n) {
        const remainder = Number(value % BASE62_BASE);
        encoded = BASE62_ALPHABET[remainder] + encoded;
        value /= BASE62_BASE;
    }

    return BASE62_ALPHABET[0].repeat(leadingZeroCount) + encoded;
}

export function decodeBase62(text) {
    const normalized = String(text);
    if (!normalized) {
        return '';
    }

    let leadingZeroCount = 0;
    while (
        leadingZeroCount < normalized.length &&
        normalized[leadingZeroCount] === BASE62_ALPHABET[0]
    ) {
        leadingZeroCount++;
    }

    let value = 0n;
    for (const char of normalized) {
        const digit = base62CharMap.get(char);
        if (digit === undefined) {
            throw new Error('Invalid base62 encoded text');
        }
        value = (value * BASE62_BASE) + digit;
    }

    const decodedBytes = [];
    while (value > 0n) {
        decodedBytes.push(Number(value % BASE256));
        value /= BASE256;
    }
    decodedBytes.reverse();

    const totalBytes = new Uint8Array(leadingZeroCount + decodedBytes.length);
    totalBytes.set(decodedBytes, leadingZeroCount);

    try {
        return utf8Decoder.decode(totalBytes);
    } catch (_) {
        throw new Error('Invalid base62 encoded text');
    }
}

export function encodeBase64(text) {
    return btoa(text);
}

export function decodeBase64(text) {
    return atob(text);
}

export function encodeUrl(text) {
    return encodeURIComponent(text).replace(/%20/g, ' ');
}

export function decodeUrl(text) {
    try {
        return decodeURIComponent(text.replace(/ /g, '%20'));
    } catch (error) {
        throw new Error('Invalid URL encoded text');
    }
}

const XML_ENCODE_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '£': '&pound;',
    '¢': '&cent;',
    '¥': '&yen;',
    '§': '&sect;',
    '¶': '&para;',
    '†': '&dagger;',
    '‡': '&Dagger;',
    '•': '&bull;',
    '…': '&hellip;',
    '–': '&ndash;',
    '—': '&mdash;',
    '′': '&prime;',
    '″': '&Prime;',
    '‹': '&lsaquo;',
    '›': '&rsaquo;',
    '«': '&laquo;',
    '»': '&raquo;',
    '←': '&larr;',
    '→': '&rarr;',
    '↑': '&uarr;',
    '↓': '&darr;',
    '↔': '&harr;',
    '↵': '&crarr;',
    '⌈': '&lceil;',
    '⌉': '&rceil;',
    '⌊': '&lfloor;',
    '⌋': '&rfloor;',
    '◊': '&loz;',
    '♠': '&spades;',
    '♣': '&clubs;',
    '♥': '&hearts;',
    '♦': '&diams;',
    'α': '&alpha;',
    'β': '&beta;',
    'γ': '&gamma;',
    'δ': '&delta;',
    'ε': '&epsilon;',
    'ζ': '&zeta;',
    'η': '&eta;',
    'θ': '&theta;',
    'ι': '&iota;',
    'κ': '&kappa;',
    'λ': '&lambda;',
    'μ': '&mu;',
    'ν': '&nu;',
    'ξ': '&xi;',
    'ο': '&omicron;',
    'π': '&pi;',
    'ρ': '&rho;',
    'ς': '&sigmaf;',
    'σ': '&sigma;',
    'τ': '&tau;',
    'υ': '&upsilon;',
    'φ': '&phi;',
    'χ': '&chi;',
    'ψ': '&psi;',
    'ω': '&omega;',
    'ϑ': '&thetasym;',
    'ϒ': '&upsih;',
    'ϖ': '&piv;',
    '‾': '&oline;',
    '⁄': '&frasl;',
    '℘': '&weierp;',
    'ℑ': '&image;',
    'ℜ': '&real;',
    'ℵ': '&alefsym;',
};

const XML_DECODE_ENTITIES = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&cent;': '¢',
    '&yen;': '¥',
    '&sect;': '§',
    '&para;': '¶',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&bull;': '•',
    '&hellip;': '…',
    '&ndash;': '–',
    '&mdash;': '—',
    '&prime;': '′',
    '&Prime;': '″',
    '&lsaquo;': '‹',
    '&rsaquo;': '›',
    '&laquo;': '«',
    '&raquo;': '»',
    '&larr;': '←',
    '&rarr;': '→',
    '&uarr;': '↑',
    '&darr;': '↓',
    '&harr;': '↔',
    '&crarr;': '↵',
    '&lceil;': '⌈',
    '&rceil;': '⌉',
    '&lfloor;': '⌊',
    '&rfloor;': '⌋',
    '&loz;': '◊',
    '&spades;': '♠',
    '&clubs;': '♣',
    '&hearts;': '♥',
    '&diams;': '♦',
    '&alpha;': 'α',
    '&beta;': 'β',
    '&gamma;': 'γ',
    '&delta;': 'δ',
    '&epsilon;': 'ε',
    '&zeta;': 'ζ',
    '&eta;': 'η',
    '&theta;': 'θ',
    '&iota;': 'ι',
    '&kappa;': 'κ',
    '&lambda;': 'λ',
    '&mu;': 'μ',
    '&nu;': 'ν',
    '&xi;': 'ξ',
    '&omicron;': 'ο',
    '&pi;': 'π',
    '&rho;': 'ρ',
    '&sigmaf;': 'ς',
    '&sigma;': 'σ',
    '&tau;': 'τ',
    '&upsilon;': 'υ',
    '&phi;': 'φ',
    '&chi;': 'χ',
    '&psi;': 'ψ',
    '&omega;': 'ω',
    '&thetasym;': 'ϑ',
    '&upsih;': 'ϒ',
    '&piv;': 'ϖ',
    '&oline;': '‾',
    '&frasl;': '⁄',
    '&weierp;': '℘',
    '&image;': 'ℑ',
    '&real;': 'ℜ',
    '&alefsym;': 'ℵ',
};

export function encodeXml(text) {
    return text.replace(/[&<>"']|[^\x20-\x7E]/g, char => {
        if (char === "'") return '&apos;';
        return XML_ENCODE_ENTITIES[char] || `&#${char.charCodeAt(0)};`;
    });
}

export function decodeXml(text) {
    let decoded = text.replace(/&(amp|lt|gt|quot|apos|[a-zA-Z]+);/g, entity => XML_DECODE_ENTITIES[entity] || entity);
    return decoded.replace(/&#(\d+);/g, (match, dec) => XML_DECODE_ENTITIES[match] || String.fromCharCode(dec));
}

export function encodeJson(text) {
    const escaped = JSON.stringify(String(text));
    return escaped.substring(1, escaped.length - 1);
}

export function decodeJson(text) {
    const raw = String(text).trim();
    try {
        const candidate = (raw.startsWith('"') && raw.endsWith('"')) ? raw : `"${raw}"`;
        return JSON.parse(candidate);
    } catch (_) {
        try {
            const obj = JSON.parse(raw);
            return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
        } catch (error) {
            throw new Error('Invalid JSON encoded text');
        }
    }
}
