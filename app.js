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
} from './encoding.js?v={{COMMIT_SHA}}';

const FORMATS = {
    base64: { label: 'Base64', hint: 'Text or files, including binary uploads' },
    base32: { label: 'Base32', hint: 'RFC 4648-style alphanumeric encoding' },
    base62: { label: 'Base62', hint: 'Compact letters-and-numbers encoding' },
    hex: { label: 'Hexadecimal', hint: 'UTF-8 bytes as hex characters' },
    html: { label: 'HTML Entities', hint: 'Named and numeric HTML entities' },
    xml: { label: 'XML Entities', hint: 'XML-safe characters and entities' },
    url: { label: 'URL', hint: 'Percent-encoding for query values' },
    json: { label: 'JSON', hint: 'Escape or unescape JSON string content' },
};

const encoders = {
    base64: {
        encode: async (input) => {
            if (input instanceof File) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = String(reader.result);
                        resolve(result.includes(',') ? result.split(',')[1] : result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(input);
                });
            }
            return encodeBase64(input);
        },
        decode: (text) => {
            try {
                return decodeBase64(text);
            } catch {
                throw new Error('Invalid Base64 encoded text');
            }
        },
    },
    base62: {
        encode: async (input) => encodeBase62(await readText(input)),
        decode: async (input) => decodeBase62(await readText(input)),
    },
    url: {
        encode: async (input) => encodeUrl(await readText(input)),
        decode: async (input) => decodeUrl(await readText(input)),
    },
    xml: {
        encode: async (input) => encodeXml(await readText(input)),
        decode: async (input) => decodeXml(await readText(input)),
    },
    json: {
        encode: async (input) => encodeJson(await readText(input)),
        decode: async (input) => decodeJson(await readText(input)),
    },
    html: {
        encode: async (input) => encodeHtml(await readText(input)),
        decode: async (input) => decodeHtml(await readText(input)),
    },
    hex: {
        encode: async (input) => encodeHex(await readText(input)),
        decode: async (input) => decodeHex(await readText(input)),
    },
    base32: {
        encode: async (input) => encodeBase32(await readText(input)),
        decode: async (input) => decodeBase32(await readText(input)),
    },
};

function readText(input) {
    return input instanceof File ? input.text() : String(input ?? '');
}

function readStoredPrefs() {
    try {
        return JSON.parse(localStorage.getItem('encode-prefs') || '{}');
    } catch {
        return {};
    }
}

function readTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
        return 'dark';
    }
}

function createStore(initial) {
    let state = { ...initial };
    const listeners = new Set();

    return {
        get: () => state,
        set(patch) {
            state = { ...state, ...patch };
            listeners.forEach((listener) => listener(state));
            return state;
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(state);
            return () => listeners.delete(listener);
        },
    };
}

function formatCount(text) {
    if (!text) {
        return 'Empty';
    }
    const characters = [...text].length;
    const bytes = new TextEncoder().encode(text).length;
    return `${characters.toLocaleString()} characters · ${bytes.toLocaleString()} bytes`;
}

const params = new URLSearchParams(window.location.search);
const prefs = readStoredPrefs();
const initialType = params.get('type') || prefs.type || 'base64';
const initialMode = params.get('mode') || prefs.mode || 'encode';

const store = createStore({
    type: encoders[initialType] ? initialType : 'base64',
    mode: initialMode === 'decode' ? 'decode' : 'encode',
    source: 'text',
    input: '',
    file: null,
    output: '',
    error: '',
    theme: readTheme(),
    copied: false,
    notice: null,
});

const els = {
    themeToggle: document.getElementById('themeToggle'),
    textTab: document.getElementById('textTab'),
    fileTab: document.getElementById('fileTab'),
    textInputContainer: document.getElementById('textInputContainer'),
    fileInputContainer: document.getElementById('fileInputContainer'),
    inputText: document.getElementById('inputText'),
    inputFile: document.getElementById('inputFile'),
    outputText: document.getElementById('outputText'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    encodingType: document.getElementById('encodingType'),
    encodeRadio: document.getElementById('encodeRadio'),
    decodeRadio: document.getElementById('decodeRadio'),
    notification: document.getElementById('notification'),
    formatHint: document.getElementById('formatHint'),
    inputMeta: document.getElementById('inputMeta'),
    outputMeta: document.getElementById('outputMeta'),
    fileName: document.getElementById('fileName'),
    dropzone: document.getElementById('dropzone'),
    swapBtn: document.getElementById('swapBtn'),
    clearBtn: document.getElementById('clearBtn'),
};

let processSeq = 0;
let copyTimer = 0;
let noticeTimer = 0;

function persistPrefs(state) {
    localStorage.setItem('encode-prefs', JSON.stringify({
        type: state.type,
        mode: state.mode,
    }));
    localStorage.setItem('theme', state.theme);
}

function syncURL(state) {
    const next = new URLSearchParams(window.location.search);
    next.set('type', state.type);
    next.set('mode', state.mode);
    const nextSearch = `?${next.toString()}`;
    if (nextSearch !== window.location.search) {
        window.history.replaceState({}, '', `${window.location.pathname}${nextSearch}`);
    }
}

function notify(message, type = 'success') {
    window.clearTimeout(noticeTimer);
    store.set({ notice: { message, type } });
    noticeTimer = window.setTimeout(() => {
        store.set({ notice: null });
    }, 2800);
}

async function processCurrent() {
    const id = ++processSeq;
    const { type, mode, source, input, file } = store.get();
    const encoder = encoders[type];
    const hasFile = source === 'file' && file instanceof File;
    const raw = hasFile ? file : input;

    if (!encoder) {
        store.set({ output: '', error: 'Unsupported encoding type' });
        return;
    }

    if (!hasFile && !input) {
        store.set({ output: '', error: '' });
        return;
    }

    try {
        const result = mode === 'encode'
            ? await encoder.encode(raw)
            : await encoder.decode(raw);
        if (id !== processSeq) {
            return;
        }
        store.set({ output: result, error: '' });
    } catch (error) {
        if (id !== processSeq) {
            return;
        }
        store.set({
            output: '',
            error: error instanceof Error ? error.message : 'Error processing text',
        });
    }
}

function setState(patch, { process = false } = {}) {
    const previous = store.get();
    const state = store.set(patch);
    if (previous.type !== state.type || previous.mode !== state.mode || previous.theme !== state.theme) {
        persistPrefs(state);
        syncURL(state);
    }
    if (process) {
        processCurrent();
    }
}

function render(state) {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
        'content',
        state.theme === 'light' ? '#f3f5f8' : '#0b0d10'
    );

    if (els.encodingType.value !== state.type) {
        els.encodingType.value = state.type;
    }
    els.encodeRadio.checked = state.mode === 'encode';
    els.decodeRadio.checked = state.mode === 'decode';
    els.formatHint.textContent = FORMATS[state.type]?.hint || '';

    const isText = state.source === 'text';
    els.textTab.classList.toggle('active', isText);
    els.fileTab.classList.toggle('active', !isText);
    els.textTab.setAttribute('aria-selected', String(isText));
    els.fileTab.setAttribute('aria-selected', String(!isText));
    els.textInputContainer.hidden = !isText;
    els.fileInputContainer.hidden = isText;

    if (document.activeElement !== els.inputText && els.inputText.value !== state.input) {
        els.inputText.value = state.input;
    } else if (document.activeElement === els.inputText && !state.input && els.inputText.value) {
        els.inputText.value = '';
    }

    const outputValue = state.error ? `Error processing text: ${state.error}` : state.output;
    if (els.outputText.value !== outputValue) {
        els.outputText.value = outputValue;
    }

    if (state.source === 'file' && state.file) {
        els.inputMeta.textContent = `${state.file.name} · ${state.file.size.toLocaleString()} bytes`;
        els.fileName.textContent = state.file.name;
    } else {
        els.inputMeta.textContent = formatCount(state.input);
        els.fileName.textContent = 'Drop a file or click to browse';
    }

    els.outputMeta.textContent = state.error ? state.error : formatCount(state.output);
    els.copyBtn.disabled = !state.output || Boolean(state.error);
    els.downloadBtn.disabled = !state.output || Boolean(state.error);
    els.copyBtn.classList.toggle('success', state.copied);

    if (state.notice) {
        els.notification.textContent = state.notice.message;
        els.notification.className = `notification ${state.notice.type} show`;
    } else {
        els.notification.textContent = '';
        els.notification.className = 'notification';
    }
}

store.subscribe(render);

els.encodingType.addEventListener('change', () => {
    setState({ type: els.encodingType.value }, { process: true });
});

els.encodeRadio.addEventListener('change', () => {
    setState({ mode: 'encode' }, { process: true });
});

els.decodeRadio.addEventListener('change', () => {
    setState({ mode: 'decode' }, { process: true });
});

els.inputText.addEventListener('input', () => {
    setState({ input: els.inputText.value, source: 'text', file: null }, { process: true });
});

function activateSource(source) {
    if (source === store.get().source) {
        return;
    }
    setState({
        source,
        input: '',
        file: null,
        output: '',
        error: '',
        copied: false,
    });
    els.inputText.value = '';
    els.inputFile.value = '';
}

els.textTab.addEventListener('click', () => activateSource('text'));
els.fileTab.addEventListener('click', () => activateSource('file'));

async function useFile(file) {
    if (!file) {
        return;
    }
    let input = '';
    try {
        input = await file.text();
    } catch (error) {
        setState({
            source: 'file',
            file,
            input: '',
            output: '',
            error: `Error reading file: ${error.message}`,
        });
        return;
    }
    setState({ source: 'file', file, input, error: '' }, { process: true });
}

els.inputFile.addEventListener('change', (event) => {
    useFile(event.target.files?.[0]);
});

['dragenter', 'dragover'].forEach((eventName) => {
    els.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dropzone.classList.add('dragover');
    });
});

['dragleave', 'drop'].forEach((eventName) => {
    els.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dropzone.classList.remove('dragover');
    });
});

els.dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) {
        useFile(file);
    }
});

els.themeToggle.addEventListener('click', () => {
    const next = store.get().theme === 'dark' ? 'light' : 'dark';
    setState({ theme: next });
});

els.swapBtn.addEventListener('click', () => {
    const { output, error, mode } = store.get();
    const nextInput = error ? '' : output;
    els.inputText.value = nextInput;
    els.inputFile.value = '';
    setState({
        source: 'text',
        input: nextInput,
        file: null,
        mode: mode === 'encode' ? 'decode' : 'encode',
        copied: false,
    }, { process: true });
});

els.clearBtn.addEventListener('click', () => {
    els.inputText.value = '';
    els.inputFile.value = '';
    setState({
        input: '',
        file: null,
        output: '',
        error: '',
        copied: false,
    });
});

async function copyText(text) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall back to a hidden textarea for non-secure or restricted contexts.
        }
    }

    const probe = document.createElement('textarea');
    probe.value = text;
    probe.setAttribute('readonly', '');
    probe.style.position = 'fixed';
    probe.style.left = '-9999px';
    document.body.appendChild(probe);
    probe.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(probe);
    return copied;
}

els.copyBtn.addEventListener('click', async () => {
    const { output, error } = store.get();
    if (!output || error) {
        return;
    }

    const copied = await copyText(output);
    if (!copied) {
        notify('Could not copy to clipboard', 'error');
        return;
    }

    window.clearTimeout(copyTimer);
    setState({ copied: true });
    copyTimer = window.setTimeout(() => setState({ copied: false }), 2000);
});

els.downloadBtn.addEventListener('click', () => {
    const { output, error, type, mode } = store.get();
    if (!output || error) {
        notify('No output to download', 'error');
        return;
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode}-${type}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

processCurrent();
