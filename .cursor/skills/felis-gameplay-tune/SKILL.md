---
name: felis-gameplay-tune
description: >-
  Tunes Felis combat, movement, and stamina with private multipliers so prefabs
  cannot shadow code. Use when the user asks to change damage, attack speed,
  punch range, stamina, jump, or enemy AI cadence for Prospero or enemies.
---

# Gameplay tune

## When

The user named a knob and a number (for example stamina recharge, rat attack delay, bear punch range).

## Steps

1. Read `VARIABLE_MAP.md` and the one script they named.
2. Say which file and which `private var` will change before editing.
3. Multiply in code. Do not edit the serialized default of an existing `var`.
4. Player-only changes must check the Player tag or Prospero. Enemy changes must not touch the player script.
5. After the edit, update `VARIABLE_MAP.md` with the new number and why.

## Never

- Never change punch connect range and AI start-swing range in the same edit unless the user asked for both.
- Never add a player-side range multiplier to "fix" an enemy.
- Never edit prefabs, scenes, or `ProjectSettings`.
- Never commit unless asked.
