import { test, expect } from '@playwright/test';

test.describe('Encoding Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('loads and displays main UI', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Text Encoding and Decoding' })).toBeVisible();
        await expect(page.getByLabel('Select encoding type')).toBeVisible();
        await expect(page.getByLabel('Input text')).toBeVisible();
        await expect(page.getByLabel('Output text')).toBeVisible();
    });

    test('Base64 encode and decode', async ({ page }) => {
        await page.getByLabel('Select encoding type').selectOption('base64');
        await page.getByLabel('Input text').fill('hello');
        await expect(page.getByLabel('Output text')).toHaveValue('aGVsbG8=');

        await page.getByLabel('Decode text').click();
        await page.getByLabel('Input text').fill('aGVsbG8=');
        await expect(page.getByLabel('Output text')).toHaveValue('hello');
    });

    test('Base62 encode and decode', async ({ page }) => {
        await page.getByLabel('Select encoding type').selectOption('base62');
        await page.getByLabel('Input text').fill('hello');
        const encoded = await page.getByLabel('Output text').inputValue();
        expect(encoded.length).toBeGreaterThan(0);

        await page.getByLabel('Decode text').click();
        await page.getByLabel('Input text').fill(encoded);
        await expect(page.getByLabel('Output text')).toHaveValue('hello');
    });

    test('URL encode and decode', async ({ page }) => {
        await page.getByLabel('Select encoding type').selectOption('url');
        await page.getByLabel('Input text').fill('hello world');
        await expect(page.getByLabel('Output text')).toHaveValue('hello world');

        await page.getByLabel('Decode text').click();
        await expect(page.getByLabel('Output text')).toHaveValue('hello world');
    });

    test('XML encode and decode', async ({ page }) => {
        await page.getByLabel('Select encoding type').selectOption('xml');
        await page.getByLabel('Input text').fill('<tag>');
        await expect(page.getByLabel('Output text')).toHaveValue('&lt;tag&gt;');

        await page.getByLabel('Decode text').click();
        await expect(page.getByLabel('Output text')).toHaveValue('<tag>');
    });

    test('JSON encode and decode', async ({ page }) => {
        await page.getByLabel('Select encoding type').selectOption('json');
        await page.getByLabel('Input text').fill('hello');
        await expect(page.getByLabel('Output text')).toHaveValue('hello');

        await page.getByLabel('Input text').fill('say "hi"');
        const encoded = await page.getByLabel('Output text').inputValue();
        expect(encoded).toContain('\\"');

        await page.getByLabel('Decode text').click();
        await page.getByLabel('Input text').fill(encoded);
        await expect(page.getByLabel('Output text')).toHaveValue('say "hi"');
    });

    test('switches between Text and File tabs', async ({ page }) => {
        await expect(page.getByRole('tab', { name: 'Text' })).toBeVisible();
        await expect(page.getByLabel('Input text')).toBeVisible();

        await page.getByRole('tab', { name: 'File' }).click();
        await expect(page.getByLabel('Upload file')).toBeVisible();

        await page.getByRole('tab', { name: 'Text' }).click();
        await expect(page.getByLabel('Input text')).toBeVisible();
    });

    test('theme toggle works', async ({ page }) => {
        const html = page.locator('html');
        const initialTheme = await html.getAttribute('data-theme');

        await page.getByLabel('Toggle dark mode').click();
        const newTheme = await html.getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);

        await page.getByLabel('Toggle dark mode').click();
        const restoredTheme = await html.getAttribute('data-theme');
        expect(restoredTheme).toBe(initialTheme);
    });

    test('copy button shows success state', async ({ page }) => {
        await page.getByLabel('Input text').fill('hello');
        await expect(page.getByLabel('Output text')).toHaveValue('aGVsbG8=');

        await page.getByLabel('Copy to clipboard').click();
        await expect(page.getByLabel('Copy to clipboard')).toHaveClass(/success/);
    });

    test('download button is enabled when there is output', async ({ page }) => {
        await page.getByLabel('Input text').fill('hello');
        const downloadBtn = page.getByLabel('Download output');
        await expect(downloadBtn).toBeEnabled();
        await downloadBtn.click();
        // Button should remain - we can't easily verify download in headless
        await expect(downloadBtn).toBeVisible();
    });

    test('URL parameters set encoding type and mode', async ({ page }) => {
        await page.goto('/?type=base64&mode=decode');
        await expect(page.getByLabel('Select encoding type')).toHaveValue('base64');
        await expect(page.getByLabel('Decode text')).toBeChecked();

        await page.goto('/?type=xml&mode=encode');
        await expect(page.getByLabel('Select encoding type')).toHaveValue('xml');
        await expect(page.getByLabel('Encode text')).toBeChecked();
    });

    test('real-time processing on input change', async ({ page }) => {
        await page.getByLabel('Select encoding type').selectOption('base64');
        await page.getByLabel('Input text').fill('a');
        await expect(page.getByLabel('Output text')).toHaveValue('YQ==');

        await page.getByLabel('Input text').fill('ab');
        await expect(page.getByLabel('Output text')).toHaveValue('YWI=');
    });

    test('clears output when input is cleared', async ({ page }) => {
        await page.getByLabel('Input text').fill('hello');
        await expect(page.getByLabel('Output text')).not.toHaveValue('');

        await page.getByLabel('Input text').fill('');
        await expect(page.getByLabel('Output text')).toHaveValue('');
    });
});

test.describe('libs/encoding entry point', () => {
    test('loads encoding page', async ({ page }) => {
        await page.goto('/libs/encoding');
        await expect(page.getByRole('heading', { name: 'Text Encoding and Decoding' })).toBeVisible();
    });

    test('encoding works from libs/encoding path', async ({ page }) => {
        await page.goto('/libs/encoding');
        await page.getByLabel('Select encoding type').selectOption('base64');
        await page.getByLabel('Input text').fill('test');
        await expect(page.getByLabel('Output text')).toHaveValue('dGVzdA==');
    });
});
