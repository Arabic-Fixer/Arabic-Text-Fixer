(() => {
  const inputEl     = document.getElementById('input');
  const outputEl    = document.getElementById('output');
  const modeEl      = document.getElementById('mode');
  const fixBtn      = document.getElementById('fix-btn');
  const clearBtn    = document.getElementById('clear-btn');
  const copyBtn     = document.getElementById('copy-btn');
  const copyLabel   = document.getElementById('copy-label');
  const outputField = document.getElementById('output-field');
  const toast       = document.getElementById('toast');

  let lastHtml  = '';
  let toastTimer = null;

  function showToast(msg, duration = 2200) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function showOutput(plain, html) {
    outputEl.value = plain;
    lastHtml       = html;
    outputField.style.display = 'flex';
    copyLabel.textContent = 'Copy Output';
    copyBtn.classList.remove('copied');
  }

  fixBtn.addEventListener('click', () => {
    const raw = inputEl.value;
    if (!raw.trim()) {
      showToast('Paste some Arabic text first');
      return;
    }
    const mode   = modeEl.value;
    const result = fixArabic(raw, mode);
    showOutput(result.plain, result.html);
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value  = '';
    outputEl.value = '';
    lastHtml       = '';
    outputField.style.display = 'none';
    inputEl.focus();
  });

  copyBtn.addEventListener('click', async () => {
    const plain = outputEl.value;
    if (!plain) return;

    let success = false;

    // Primary: write both text/html + text/plain so Word gets RTL HTML
    if (lastHtml && typeof ClipboardItem !== 'undefined') {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html':  new Blob([lastHtml], { type: 'text/html' }),
            'text/plain': new Blob([plain],    { type: 'text/plain' }),
          }),
        ]);
        success = true;
      } catch (e) {
        // fall through to plain-text fallback
      }
    }

    // Fallback: plain text only
    if (!success) {
      try {
        await navigator.clipboard.writeText(plain);
        success = true;
      } catch {
        outputEl.select();
        document.execCommand('copy');
        success = true;
      }
    }

    if (success) {
      copyLabel.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      showToast('Copied — paste directly into Word / Docs ✓');
      setTimeout(() => {
        copyLabel.textContent = 'Copy Output';
        copyBtn.classList.remove('copied');
      }, 2200);
    }
  });

  // Ctrl/Cmd+Enter triggers fix from input
  inputEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') fixBtn.click();
  });

  // Restore last used mode
  chrome.storage.local.get(['lastMode'], (res) => {
    if (res.lastMode) modeEl.value = res.lastMode;
  });

  modeEl.addEventListener('change', () => {
    chrome.storage.local.set({ lastMode: modeEl.value });
  });
})();
