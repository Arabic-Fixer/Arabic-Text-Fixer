/**
 * Arabic Fixer — Core Text Processing Engine
 * Shared by popup.js and background.js (via importScripts).
 */

const RLM  = '\u200F'; // Right-to-Left Mark
const LRM  = '\u200E'; // Left-to-Right Mark

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LATIN_RE  = /[A-Za-z0-9]/;

function isArabic(ch) { return ARABIC_RE.test(ch); }
function isLatin(ch)  { return LATIN_RE.test(ch); }

/**
 * STEP 1 — Strip invisible / problematic Unicode characters.
 */
function stripInvisibles(text) {
  return text
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[\u200B\uFEFF\u00AD]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[\uFFFC\uFFFD]/g, '');
}

/**
 * STEP 2 — Normalise whitespace and line breaks.
 */
function normaliseWhitespace(text) {
  return text
    // Convert non-breaking and exotic spaces to regular space
    .replace(/[\u00A0\u202F\u205F\u3000\u2002-\u200A]+/g, ' ')
    // Normalise line endings
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    // Collapse runs of blank lines to a single blank line
    .replace(/\n{3,}/g, '\n\n')
    // Collapse multiple spaces AND tabs on a single line to one space
    .replace(/[ \t]+/g, ' ')
    // Remove leading/trailing space on every line
    .split('\n').map(l => l.trim()).join('\n')
    .trim();
}

/**
 * STEP 3 — Standardise Arabic punctuation, context-aware.
 *
 * Key rules:
 *  - Replace Western ? → ؟  (always safe in Arabic text)
 *  - Replace Western , → ،  ONLY when NOT between/after digits
 *    (preserves number formatting: 1,079 / 1,000.50 stay intact)
 *  - Replace Western ; → ؛  ONLY when not in a URL or code context
 *  - Preserve existing ،،، patterns (formal letter endings)
 *  - Do NOT collapse repeated Arabic commas ،،، (intentional in formal Arabic)
 */
function fixPunctuation(text) {
  return text
    // Western ? → Arabic ؟ (safe: ? never appears in Arabic numbers)
    .replace(/\?/g, '؟')

    // Western , → Arabic ،
    // Negative lookbehind/lookahead for digits keeps "1,079" and "1,000.00" intact.
    // Also skips commas inside URLs (preceded by a letter and followed by a letter = ok to replace).
    .replace(/(?<!\d),(?!\d)/g, '،')

    // Western ; → Arabic ؛ only when not between Latin characters (skip URLs / code)
    .replace(/(?<![A-Za-z]);(?![A-Za-z/])/g, '؛')

    // Remove stray space BEFORE Arabic end-punctuation
    .replace(/\s+([؟،؛!])/g, '$1')
    // Remove stray space inside parentheses
    .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
    // Collapse repeated Western exclamation marks
    .replace(/!{2,}/g, '!')
    // Collapse repeated Western ? (Arabic ؟ patterns like ؟؟؟ are intentional — leave them)
    .replace(/\?{2,}/g, '؟')
    // 4+ dots → ellipsis
    .replace(/\.{4,}/g, '...')
    // Ensure space after Arabic end-punctuation when followed by text
    .replace(/([؟؛!])([^\s\n،])/g, '$1 $2');
}

/**
 * STEP 4 — Fix spacing around mixed Arabic/Latin tokens.
 * Ensures exactly one space at each language boundary.
 */
function fixMixedSpacing(text) {
  // Arabic immediately followed by Latin (letter or digit)
  text = text.replace(/([\u0600-\u06FF])([\u0041-\u007A\u0041-\u005A\u0030-\u0039])/g, '$1 $2');
  // Latin (letter or digit) immediately followed by Arabic
  text = text.replace(/([\u0041-\u007A\u0041-\u005A\u0030-\u0039])([\u0600-\u06FF])/g, '$1 $2');
  return text;
}

/**
 * STEP 5 — Web Safe Mode: insert RLM/LRM at every Arabic↔Latin boundary.
 */
function applyWebSafe(text) {
  let result = '';
  let prev = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (prev !== null) {
      if (isArabic(prev) && isLatin(ch))       result += LRM;
      else if (isLatin(prev) && isArabic(ch))  result += RLM;
    }
    result += ch;
    if (ch.trim() !== '') prev = ch;
  }
  return RLM + result;
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Detect characters that belong to a "Latin run" for the purposes of
 * wrapping in an LTR span inside an RTL paragraph.
 *
 * Includes:
 *  - ASCII letters and digits (A-Z, a-z, 0-9)
 *  - Punctuation that is always part of Latin/number tokens:
 *    . , / - _ @ # % + = \ : ' " ( )
 *
 * Excludes spaces (neutral — let the bidi algorithm handle them).
 */
const LATIN_RUN_RE = /[A-Za-z0-9.\-_@#%+=/\\:'"(),]/;

function isLatinRunChar(ch) {
  return LATIN_RUN_RE.test(ch);
}

/**
 * Build an RTL-safe HTML string that Word, Google Docs, and Notion
 * understand as a right-to-left block.
 *
 * Strategy:
 *  - Outer <div> and every <p> carry dir="rtl" + inline CSS.
 *  - Latin/number runs are wrapped in <span dir="ltr"> so they stay
 *    visually left-to-right inside the RTL paragraph.
 *  - Spaces are kept as plain text (Unicode bidi neutral) so Word's
 *    paragraph-level RTL setting handles word order correctly.
 */
function buildRtlHtml(cleanText) {
  const paragraphs = cleanText.split('\n');

  const pTags = paragraphs.map(line => {
    if (line.trim() === '') return '<p dir="rtl" style="direction:rtl;margin:0 0 4pt 0;">&nbsp;</p>';

    let html = '';
    let i = 0;

    while (i < line.length) {
      const ch = line[i];

      if (ch === ' ') {
        // Neutral space — output as-is so bidi order is not disturbed
        html += ' ';
        i++;
      } else if (isLatinRunChar(ch)) {
        // Collect the entire Latin/number run (no spaces — stop at space)
        let run = '';
        while (i < line.length && line[i] !== ' ' && isLatinRunChar(line[i])) {
          run += line[i++];
        }
        // Strip purely-punctuation-only runs that are actually Arabic context
        // (e.g. a lone "." at the end): only wrap if it contains a letter/digit.
        if (/[A-Za-z0-9]/.test(run)) {
          html += `<span dir="ltr" style="direction:ltr;unicode-bidi:embed;">${escapeHtml(run)}</span>`;
        } else {
          html += escapeHtml(run);
        }
      } else {
        html += escapeHtml(ch);
        i++;
      }
    }

    return `<p dir="rtl" style="direction:rtl;text-align:right;margin:0 0 4pt 0;">${html}</p>`;
  });

  return [
    '<!DOCTYPE html><html><head>',
    '<meta charset="utf-8">',
    '</head><body>',
    '<div dir="rtl" style="direction:rtl;text-align:right;',
    'font-family:Arial,Tahoma,\'Times New Roman\',sans-serif;font-size:12pt;">',
    pTags.join('\n'),
    '</div></body></html>',
  ].join('');
}

/**
 * Main entry point — returns { plain, html }.
 *
 * @param {string} text  Raw input text
 * @param {'clean'|'word'|'web'} mode
 * @returns {{ plain: string, html: string }}
 */
function fixArabic(text, mode = 'clean') {
  if (!text || !text.trim()) return { plain: '', html: '' };

  let out = text;
  out = stripInvisibles(out);
  out = normaliseWhitespace(out);
  out = fixPunctuation(out);
  out = fixMixedSpacing(out);

  let plain = out;
  if (mode === 'web') {
    plain = applyWebSafe(out);
  }

  const html = buildRtlHtml(out);

  return { plain, html };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fixArabic, buildRtlHtml };
}
