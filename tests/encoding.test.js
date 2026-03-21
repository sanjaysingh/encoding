import { describe, it, expect } from 'vitest';
import {
    encodeBase62,
    decodeBase62,
    encodeBase64,
    decodeBase64,
    encodeUrl,
    decodeUrl,
    encodeXml,
    decodeXml,
    encodeJson,
    decodeJson,
    encodeHtml,
    decodeHtml,
    encodeHex,
    decodeHex,
    encodeBase32,
    decodeBase32,
} from '../encoding.js';

describe('Base62', () => {
    it('encodes and decodes simple text', () => {
        const text = 'hello';
        expect(decodeBase62(encodeBase62(text))).toBe(text);
    });

    it('encodes empty string', () => {
        expect(encodeBase62('')).toBe('');
    });

    it('decodes empty string', () => {
        expect(decodeBase62('')).toBe('');
    });

    it('encodes and decodes Unicode', () => {
        const text = 'Hello 世界';
        expect(decodeBase62(encodeBase62(text))).toBe(text);
    });

    it('encodes and decodes leading zeros', () => {
        const text = '\0\0abc';
        expect(decodeBase62(encodeBase62(text))).toBe(text);
    });

    it('throws on invalid base62 characters when decoding', () => {
        expect(() => decodeBase62('hello!')).toThrow('Invalid base62 encoded text');
    });
});

describe('Base64', () => {
    it('encodes and decodes simple text', () => {
        const text = 'hello';
        expect(decodeBase64(encodeBase64(text))).toBe(text);
    });

    it('encodes empty string', () => {
        expect(encodeBase64('')).toBe('');
    });

    it('decodes empty string', () => {
        expect(decodeBase64('')).toBe('');
    });

    it('encodes and decodes special characters', () => {
        const text = 'a+b/c=d';
        expect(decodeBase64(encodeBase64(text))).toBe(text);
    });

    it('handles binary-like content', () => {
        const text = 'Hello\nWorld\t';
        expect(decodeBase64(encodeBase64(text))).toBe(text);
    });
});

describe('URL encoding', () => {
    it('encodes and decodes simple text', () => {
        const text = 'hello world';
        expect(decodeUrl(encodeUrl(text))).toBe(text);
    });

    it('preserves spaces in encoding (custom format)', () => {
        const encoded = encodeUrl('hello world');
        expect(decodeUrl(encoded)).toBe('hello world');
    });

    it('encodes and decodes reserved URL characters', () => {
        const text = '?key=value&foo=bar';
        expect(decodeUrl(encodeUrl(text))).toBe(text);
    });

    it('throws on invalid URL encoded text', () => {
        expect(() => decodeUrl('%')).toThrow('Invalid URL encoded text');
    });
});

describe('XML encoding', () => {
    it('encodes ampersand', () => {
        expect(encodeXml('a&b')).toBe('a&amp;b');
    });

    it('encodes less than and greater than', () => {
        expect(encodeXml('<tag>')).toBe('&lt;tag&gt;');
    });

    it('encodes quotes', () => {
        expect(encodeXml('"hello"')).toBe('&quot;hello&quot;');
        expect(encodeXml("'hello'")).toBe('&apos;hello&apos;');
    });

    it('decodes named entities', () => {
        expect(decodeXml('&amp;')).toBe('&');
        expect(decodeXml('&lt;&gt;')).toBe('<>');
        expect(decodeXml('&quot;&apos;')).toBe('"\'');
    });

    it('encodes and decodes Greek letters', () => {
        expect(decodeXml(encodeXml('αβγ'))).toBe('αβγ');
    });

    it('decodes numeric entities', () => {
        expect(decodeXml('&#65;')).toBe('A');
        expect(decodeXml('&#97;&#98;&#99;')).toBe('abc');
    });

    it('encodes and decodes round-trip', () => {
        const text = 'Hello <world> & "friends"';
        expect(decodeXml(encodeXml(text))).toBe(text);
    });
});

describe('JSON encoding', () => {
    it('encodes and decodes simple text', () => {
        const text = 'hello';
        expect(decodeJson(encodeJson(text))).toBe(text);
    });

    it('encodes special characters', () => {
        const text = 'hello\nworld\t"quoted"';
        expect(decodeJson(encodeJson(text))).toBe(text);
    });

    it('decodes JSON object as pretty-printed string', () => {
        const input = '{"a":1,"b":2}';
        const result = decodeJson(input);
        expect(result).toContain('"a": 1');
        expect(result).toContain('"b": 2');
    });

    it('decodes JSON array as pretty-printed string', () => {
        const input = '[1,2,3]';
        const result = decodeJson(input);
        expect(JSON.parse(result)).toEqual([1, 2, 3]);
    });

    it('throws on invalid JSON', () => {
        expect(() => decodeJson('{"a": ')).toThrow('Invalid JSON encoded text');
    });

    it('handles already quoted strings', () => {
        const input = '"hello"';
        expect(decodeJson(input)).toBe('hello');
    });
});

describe('HTML encoding', () => {
    it('encodes ampersand', () => {
        expect(encodeHtml('a&b')).toBe('a&amp;b');
    });

    it('encodes less than and greater than', () => {
        expect(encodeHtml('<tag>')).toBe('&lt;tag&gt;');
    });

    it('encodes quotes', () => {
        expect(encodeHtml('"hello"')).toBe('&quot;hello&quot;');
        expect(encodeHtml("'hello'")).toBe('&#39;hello&#39;');
    });

    it('encodes spaces to &nbsp;', () => {
        expect(encodeHtml('hello world')).toBe('hello&nbsp;world');
    });

    it('decodes named entities', () => {
        expect(decodeHtml('&amp;')).toBe('&');
        expect(decodeHtml('&lt;&gt;')).toBe('<>');
        expect(decodeHtml('&quot;&#39;')).toBe('"\'');
        expect(decodeHtml('&nbsp;')).toBe(' ');
    });

    it('encodes and decodes round-trip', () => {
        const text = 'Hello <world> & "friends"';
        expect(decodeHtml(encodeHtml(text))).toBe(text);
    });

    it('decodes numeric entities', () => {
        expect(decodeHtml('&#65;')).toBe('A');
        expect(decodeHtml('&#97;&#98;&#99;')).toBe('abc');
    });

    it('decodes hex entities', () => {
        expect(decodeHtml('&#x41;')).toBe('A');
        expect(decodeHtml('&#x61;&#x62;&#x63;')).toBe('abc');
    });
});

describe('Hexadecimal encoding', () => {
    it('encodes simple text', () => {
        expect(encodeHex('hello')).toBe('68656c6c6f');
    });

    it('decodes simple text', () => {
        expect(decodeHex('68656c6c6f')).toBe('hello');
    });

    it('encodes empty string', () => {
        expect(encodeHex('')).toBe('');
    });

    it('decodes empty string', () => {
        expect(decodeHex('')).toBe('');
    });

    it('encodes and decodes round-trip', () => {
        const text = 'Hello World! 123';
        expect(decodeHex(encodeHex(text))).toBe(text);
    });

    it('handles uppercase hex', () => {
        expect(decodeHex('68656C6C6F')).toBe('hello');
    });

    it('ignores whitespace in hex', () => {
        expect(decodeHex('68 65 6c 6c 6f')).toBe('hello');
    });

    it('throws on invalid hex characters', () => {
        expect(() => decodeHex('ghijkl')).toThrow('Invalid hexadecimal text');
    });

    it('throws on odd number of hex characters', () => {
        expect(() => decodeHex('68656')).toThrow('Invalid hexadecimal text: odd number of characters');
    });

    it('encodes and decodes Unicode', () => {
        const text = 'Hello 世界';
        expect(decodeHex(encodeHex(text))).toBe(text);
    });
});

describe('Base32 encoding', () => {
    it('encodes and decodes simple text', () => {
        const text = 'hello';
        expect(decodeBase32(encodeBase32(text))).toBe(text);
    });

    it('encodes empty string', () => {
        expect(encodeBase32('')).toBe('');
    });

    it('decodes empty string', () => {
        expect(decodeBase32('')).toBe('');
    });

    it('encodes and decodes Unicode', () => {
        const text = 'Hello 世界';
        expect(decodeBase32(encodeBase32(text))).toBe(text);
    });

    it('handles lowercase input', () => {
        expect(decodeBase32('nbswy3dp')).toBe('hello');
    });

    it('throws on invalid base32 characters', () => {
        expect(() => decodeBase32('hello!')).toThrow('Invalid base32 encoded text');
    });

    it('handles leading zeros', () => {
        const text = '\0\0abc';
        expect(decodeBase32(encodeBase32(text))).toBe(text);
    });

    it('ignores padding characters', () => {
        const encoded = encodeBase32('hello');
        expect(decodeBase32(encoded + '====')).toBe('hello');
    });

    it('ignores whitespace in input', () => {
        const encoded = encodeBase32('hello');
        expect(decodeBase32(encoded.slice(0, 4) + ' ' + encoded.slice(4))).toBe('hello');
    });
});
