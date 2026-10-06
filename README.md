# triage-auto

A small userscript that automatically answers multi-step questionnaire dialogs in a web page, based on a set of rules. Private side project, nightly build, no support.

## What it is for

I wrote it to speed up repetitive manual testing of a web application that shows several radio-button questionnaire dialogs in a row before a user can continue. Instead of clicking through the same answers every time, the script picks them according to rules and an optional text phrase typed in a search field.

It is meant for test environments with test data only. This repo contains only the generic engine with example rules; any site-specific configuration is kept out of it.

## How it works

1. Watches the page for a dialog (CSS selector in `CONFIG`).
2. Reads the question text and the list of answer options.
3. Finds the first rule whose `question` pattern matches, and clicks the option whose label matches the rule's `answer` pattern. An answer can also be a function, so it can depend on the phrase last typed into a search field.
4. If no rule matches, it does nothing (default) and logs the available options to the browser console, so a new rule can be added. It can optionally click the first option instead (`onUnknown: 'first'`).

It makes no network requests, stores nothing, and only acts on the page it is installed for (the `@match` pattern).

## Install

Needs Tampermonkey or Violentmonkey.

1. Create a new userscript and paste in `triage-auto.nightly.user.js`.
2. Set `@match` to the page you want it to run on.
3. Edit `CONFIG`: the dialog selector, the option selector and your `rules`.

## Example rule

```js
rules: [
  { question: /example question/i, answer: /^yes\b/i },
  { question: /another question/i, answer: (ctx) => /fast/i.test(ctx.phrase) ? /^no\b/i : /^yes\b/i },
],
```

## Status

v1 nightly: work in progress, may break. Use at your own risk and only where automating answers is appropriate.
