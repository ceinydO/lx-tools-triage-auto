// ==UserScript==
// @name         triage-auto (nightly)
// @version      1.0.0-nightly
// @description  Answers dialog prompts based on simple rules (private project, nightly build)
// @match        https://example.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// v1 nightly, private project. Set @match and CONFIG for your own page.

(function () {
  'use strict';

  const CONFIG = {
    // dialog to watch
    dialogSelector: '[role="dialog"]',
    // answer elements inside the dialog
    optionSelector: 'input[type="radio"], [role="radio"]',
    // text input whose last typed value is exposed to rules as ctx.phrase (null to disable)
    phraseInputPlaceholder: /search/i,
    // question regex -> answer regex (or a function returning one)
    rules: [
      { question: /example question/i, answer: /^yes\b/i },
      { question: /another question/i, answer: (ctx) => /fast/i.test(ctx.phrase) ? /^no\b/i : /^yes\b/i },
    ],
    // no rule matched: 'stop' does nothing, 'first' clicks the first option
    onUnknown: 'stop',
  };

  const log = (...a) => console.log('[triage-auto]', ...a);
  let phrase = '';

  if (CONFIG.phraseInputPlaceholder) {
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (e.isTrusted && el && el.tagName === 'INPUT' && CONFIG.phraseInputPlaceholder.test(el.placeholder || '') && el.value.trim()) {
        phrase = el.value.trim();
      }
    }, true);
  }

  const labelOf = (el) => ((el.closest('label') || el.parentElement || el).textContent || '').trim();
  const clickOption = (el) => (el.closest('label') || el).click();

  let answered = null;

  new MutationObserver(() => {
    const dialog = document.querySelector(CONFIG.dialogSelector);
    if (!dialog) { answered = null; return; }

    const text = dialog.innerText;
    if (answered === text) return;

    const options = [...dialog.querySelectorAll(CONFIG.optionSelector)];
    if (!options.length) return;

    const rule = CONFIG.rules.find((r) => r.question.test(text));
    let chosen = null;
    if (rule) {
      const re = typeof rule.answer === 'function' ? rule.answer({ phrase, text, options }) : rule.answer;
      chosen = options.find((o) => re.test(labelOf(o))) || null;
    }
    if (!chosen && CONFIG.onUnknown === 'first') chosen = options[0];

    answered = text;
    if (!chosen) { log('no match, skipping. options:', options.map(labelOf)); return; }

    log('picking:', labelOf(chosen));
    clickOption(chosen);
  }).observe(document.body, { childList: true, subtree: true });
})();
