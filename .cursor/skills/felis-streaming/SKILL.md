---
name: felis-streaming
description: >-
  Explains Felis world streaming in LoadPrefabByBounds.js. Use when the user
  mentions streaming, chunks, LoadPrefabByBounds, empty colliders, or
  UnloadUnusedAssets.
---

# Streaming

Streaming is one component: `Assets/Felis/Scripts/Misc/LoadPrefabByBounds.js`. Unity calls `Update`. It is not a library other scripts import.

## Read first

- The `.js` above.
- Notes in `TODO/notasRafa/LoadPrefabByBounds.MAL.txt` if the user wants the known defects.

## What matters

- Green `loadBounds`: player inside, then `Instantiate`.
- Red `destroyIfOutside`: player outside every red box, then `Destroy`. No red boxes means the chunk never unloads.
- `freeMem` calls `Resources.UnloadUnusedAssets()`, which is global.
- Row data lives in the Inspector on the scene object, not in the `.js`.

## Never

- Never edit `LoadPrefabByBounds.js` unless the user asks for that edit.
- Never treat `SetActiveManager` or `FadeByBounds` as the instantiate loop. They only show or fade.
- Never put a new analysis file in `Assets/`. Write it in `TODO/notasRafa/` and say the path first.
