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
