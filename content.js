/**
 * Arabic Fixer — Content Script
 * Listens for messages from the background service worker.
 * (Currently a thin relay; all logic lives in background.js + fixer.js)
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selected = window.getSelection()?.toString() || '';
    sendResponse({ text: selected });
  }
  return true; // keep channel open for async response
});
