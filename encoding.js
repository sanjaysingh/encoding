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

// HTML Entities (extends XML with additional named entities)
const HTML_ENCODE_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    ' ': '&nbsp;',
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

const HTML_DECODE_ENTITIES = Object.fromEntries(
    Object.entries(HTML_ENCODE_ENTITIES).map(([k, v]) => [v, k])
);

export function encodeHtml(text) {
    return text.replace(/[&<>"' ]|[^\x20-\x7E]/g, (char) => {
        if (char === ' ') return '&nbsp;';
        if (char === "'") return '&#39;';
        return HTML_ENCODE_ENTITIES[char] || `&#${char.charCodeAt(0)};`;
    });
}

export function decodeHtml(text) {
    let decoded = text.replace(/&(?:amp|lt|gt|quot|#[0-9]+|[a-zA-Z]+);/g, (entity) => {
        if (entity === '&#39;') return "'";
        return HTML_DECODE_ENTITIES[entity] || entity.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
    });
    // Handle numeric entities
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    return decoded;
}

// Hexadecimal (Base16) encoding
export function encodeHex(text) {
    const bytes = utf8Encoder.encode(String(text));
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function decodeHex(text) {
    const hex = String(text).replace(/\s/g, '');
    if (!hex) return '';
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
        throw new Error('Invalid hexadecimal text');
    }
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hexadecimal text: odd number of characters');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    try {
        return utf8Decoder.decode(bytes);
    } catch (error) {
        throw new Error('Invalid hexadecimal text: not valid UTF-8');
    }
}

// Base32 encoding (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_BASE = 32n;
const base32CharMap = new Map(
    [...BASE32_ALPHABET].map((char, index) => [char, BigInt(index)])
);

export function encodeBase32(text) {
    const bytes = utf8Encoder.encode(String(text));
    if (bytes.length === 0) {
        return '';
    }

    let leadingZeroCount = 0;
    while (leadingZeroCount < bytes.length && bytes[leadingZeroCount] === 0) {
        leadingZeroCount++;
    }

    if (leadingZeroCount === bytes.length) {
        return BASE32_ALPHABET[0].repeat(Math.ceil(leadingZeroCount * 8 / 5));
    }

    let value = 0n;
    for (let i = leadingZeroCount; i < bytes.length; i++) {
        value = (value * BASE256) + BigInt(bytes[i]);
    }

    let encoded = '';
    while (value > 0n) {
        const remainder = Number(value % BASE32_BASE);
        encoded = BASE32_ALPHABET[remainder] + encoded;
        value /= BASE32_BASE;
    }

    // Count leading zeros in the result - each 0 byte becomes 'A' characters
    // 5 base32 chars = 4 bytes = 32 bits
    const zeroBytesToEncode = leadingZeroCount % 5;
    const leadingAs = zeroBytesToEncode === 0 ? 0 : Math.ceil(zeroBytesToEncode * 8 / 5);
    const fullBlocks = Math.floor(leadingZeroCount / 5);
    const totalLeadingAs = fullBlocks * 8 + leadingAs;

    return BASE32_ALPHABET[0].repeat(totalLeadingAs) + encoded;
}

export function decodeBase32(text) {
    const normalized = String(text).toUpperCase().replace(/=+$/, '');
    if (!normalized) {
        return '';
    }

    let leadingZeroCount = 0;
    while (
        leadingZeroCount < normalized.length &&
        normalized[leadingZeroCount] === BASE32_ALPHABET[0]
    ) {
        leadingZeroCount++;
    }

    let value = 0n;
    for (const char of normalized) {
        if (char === ' ' || char === '\n' || char === '\r') continue;
        const digit = base32CharMap.get(char);
        if (digit === undefined) {
            throw new Error('Invalid base32 encoded text');
        }
        value = (value * BASE32_BASE) + digit;
    }

    const decodedBytes = [];
    while (value > 0n) {
        decodedBytes.push(Number(value % BASE256));
        value /= BASE256;
    }
    decodedBytes.reverse();

    // Convert leading 'A' count to leading zero bytes
    // 8 base32 chars = 5 zero bytes (40 bits)
    const fullBlocks = Math.floor(leadingZeroCount / 8);
    const remainingAs = leadingZeroCount % 8;
    const remainingBytes = remainingAs === 0 ? 0 : Math.floor(remainingAs * 5 / 8);
    const totalLeadingZeros = fullBlocks * 5 + remainingBytes;

    const totalBytes = new Uint8Array(totalLeadingZeros + decodedBytes.length);
    totalBytes.set(decodedBytes, totalLeadingZeros);

    try {
        return utf8Decoder.decode(totalBytes);
    } catch (_) {
        throw new Error('Invalid base32 encoded text');
    }
}
