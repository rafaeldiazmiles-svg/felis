---
name: felis-review-js
description: >-
  Reviews a Felis UnityScript file for redundancy, dead branches, and null
  risks. Use when the user asks for a code review, clean-code pass, or a list
  of what is wrong in one .js file.
---

# Review one script

## When

The user names one `.js` and asks what is wrong. Default is report only.

## Steps

1. Read that file. Do not scan the whole `Scripts` tree.
2. Report only defects: duplicated assigns, dead branches, null risks, stringly `SendMessage`, scene-wide `Find` inside spawn or `Update`.
3. Separate Unity engine behavior from logic the brother wrote.
4. If they want a readable copy, create a `.txt` in `TODO/notasRafa/` and say the path before writing.

## Never

- Never rewrite the `.js` during a review.
- Never comment every line unless they ask for a full commented copy.
- Never open prefabs to "confirm" a review. Say the Inspector is the place to check row data.
