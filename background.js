/**
 * Arabic Fixer — Background Service Worker (Manifest V3)
 */

importScripts('fixer.js');

// ── Context menu setup ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'fix-arabic',
    title: 'Fix Arabic Text',
    contexts: ['selection'],
  });
});

// ── Context menu click ────────────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'fix-arabic') return;

  const raw = info.selectionText || '';
  if (!raw.trim()) return;

  const { lastMode = 'clean' } = await chrome.storage.local.get(['lastMode']);
  const { plain, html } = fixArabic(raw, lastMode);

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: writeRtlClipboard,
      args: [plain, html],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showInPageToast,
      args: ['✓ Arabic fixed and copied — paste into Word / Docs'],
    });
  } catch (err) {
    console.error('Arabic Fixer: clipboard write failed', err);
  }
});

// ── Functions injected into the page ─────────────────────────────────────────

/**
 * Writes both text/html (RTL-safe) and text/plain to the clipboard.
 * Injected into the active tab because service workers cannot access
 * navigator.clipboard directly.
 */
async function writeRtlClipboard(plain, html) {
  // Primary: ClipboardItem with HTML + plain — Word picks up the HTML
  if (typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([html],  { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch {
      // fall through
    }
  }

  // Fallback: plain text only
  try {
    await navigator.clipboard.writeText(plain);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = plain;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

/**
 * Shows a small in-page toast notification after a successful fix.
 */
function showInPageToast(message) {
  const existing = document.getElementById('__arabic-fixer-toast__');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '__arabic-fixer-toast__';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #2e7d52;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 22px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    z-index: 2147483647;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s ease;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  });
}
