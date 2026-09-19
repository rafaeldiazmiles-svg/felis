# VARIABLE_MAP — knobs we actually touched

Easy sheet. Open this first. Numbers are **what the code has right now** (2026-09-19), not Unity Inspector.

How it works: most of these are `private var` multipliers. Prefabs keep the original numbers. On `Start()`, the script multiplies them. Change the private number here → next Play uses it. Do not look for these in the Inspector; they will not show up.

Stock = original game. Current = live value in the `.js` file.

---

## Felis (player)

| Feeling | File | Variable | Stock | Current | What the code does |
|---|---|---|---|---|---|
| Stamina refill speed | `Character Objects/Stamina.js` | `rechargeRateMul` | 1 (none) | **0.945** | `rechargeRate *= rechargeRateMul`. Path: 2.25 → 1.35 (×0.6) → 0.945 (×0.7). |
| Pause before stamina starts filling | same | `maxWaitBeforeRecharge` | prefab (~0.5) | **0.25** | Caps `waitBeforeRechargeDuration`. Regen is blocked while stamina is still dropping. |
| Extra stamina pool | same | *(removed)* | +25% | **off** | Those two lines are gone. |
| Combo hits faster each swing | `Character Objects/MeleeAttack.js` | `comboSpeedStep` | 1 | **0.88** | Each chained hit: `lastAttackDuration *= 0.88`. |
| Combo cannot get faster than this | same | `comboFloorMul` | — | **0.65** | Floor on that multiply. |
| Combo cannot cut the hit | same | `comboHitMargin` | — | **0.08** | Duration never below `applyForceTime + 0.08`. |
| Punch reach up / down | same | `verticalReachUp` / `Down` | stock | **1.4 / 1.2** | Who counts as in range vertically. |
| Knockback | same | `pushMul` | 1 | **1.4** (bees 1.5625) | Extra shove on hit. |
| Attack power | same | *(×0.99)* | stock | almost stock | Tiny tick down. |
| Air steer | `Character Objects/SideMovement.js` | `airMul` | 0.4 | **0.7** | Player only. If prefab is still ~0.4, Start sets 0.7. |
| Air accel | same | `airRunAccelMul` | 1 | **1.5** | Player only, in the air. |
| Top run speed | same | `runSpeedMul` | 1 | **1.1** | `targetRunSpeed *=` this, player only. |
| Run force | same | `runForceMul` | 1 | **1.15** | `maxRunForce *=` this, player only. |
| Launch from standstill | same | `startBoostAccelMul` | 1 | **2.2** | Extra accel until 70% of top speed (`startBoostUpTo` 0.7). |
| Wall / slope stall | same | `blockMultiplier` / `slopeMultiplier` / `highSlopeRunForce` | 0.1 / 0.7 / 0.1 | **0.22 / 0.85 / 0.22** | Soften getting stuck. |
| Skid | same | `skidRunForceMultiplier` / `skidFriction` | 0.2 / 3.0 | **0.35 / 2.2** | Player only, less sticky turnaround. |
| Snag on walls | `Character Objects/SideDetection.js` | `sideDetectionRange` | 0.4 | **0.32** | If prefab is still ~0.4, Start sets 0.32. |
| Ground jump | `Character Objects/JumpSwim.js` | `groundJumpPower` | 1 | **0.8** | 80% of stock jump. |
| Air double jump | same | `airJumpPower` + `maxAirJumps` | none | **0.6 × ground, 1 extra jump** | Air jump = 0.6 × 0.8 of stock. Gap `minTimeBetweenJumps` 0.3s. |
| Jump on slopes | same | `maxSlopeAngle` | 60 | **70** | If prefab ≤ 61, Start sets 70. Jumps go straight up on steep ground. |

---

## Enemies — how often they hit (lower mul = more aggressive)

| Who | File | Variable | Current | Floor | What the code does |
|---|---|---|---|---|---|
| Rat no shield | `AI/RatEnemy.js` | `attackDelayMul` | **0.2** | `minAttackDelay` **0.208s** | Was 0.24 / 0.25, then ×1.2 quicker (÷1.2). |
| Rat no shield | same | `attackVelocityMul` | **1.6** | — | Can swing while still walking in. |
| Rat no shield | same | `extraStrikeDelay` | **0.225s** | — | Was 0.27, ÷1.2. |
| Rat shield | `AI/RatEmemy_Shield.js` | `attackRateMul` | **0.2** | `minAttackEvery` **0.208s** | Was 0.24 / 0.25, ÷1.2. |
| Rat shield | same | `attackVelocityMul` | **1.6** | — | Same: swing while closing. |
| Rat shield | same | `holdPosInsideRangeMul` | **0.7** | — | Parks at 70% of range, not on the edge. Tick saved in `attackQueued`. |
| Bear (uses RatBoss, not BasicAttackAI) | `AI/RatBoss.js` | `attackDelayMul` + `bearAttackSpeedMul` | **0.48 then ÷1.28** | floor also ÷1.28 | Was ÷1.6, then ×0.8 speed. `Rat Boss` still uses `ratAttackSpeedMul` 1.2. |
| Bees | `AI/BeeAI.js` | `attackRateMul` | **0.48** | `minAttackEvery` **0.3s** | Dive cadence. Also player-bump knockback. |
| Eye | `AI/RangedAirAI.js` | `shootDelayMul` | **0.48** | `minShootDelay` **0.5s** | `shootDelay *=` mul. |
| Other melee brains | `AI/BasicAttackAI.js` | `attackDelayMul` / `_Other` | **0.34** bear-or-rat name, **0.48** else | `minAttackGap` **0.2s** | Also `attackDisableMul` **0.29** after you punch them. |
| All enemy melee damage | `Character Objects/MeleeAttackSimple.js` | `attackPowerMul` | **1.3** | — | `attackPower *=` 1.3 if root is not tagged Player. |
| Rat punch connect area | same | `ratPunchRangeMul` | 1 | **1.4** | Their `attackRange` ×1.4. Not bees, not the eye. |
| Bear punch connect area | same | `bearPunchRangeMul` | 1 | **1.6** | Back from 2.88. Bear first so Rat-named bones do not steal the rat mul. |

---

## HP / hive / world

| What | File | Variable | Current | What the code does |
|---|---|---|---|---|
| Barricades / spikes HP | `Character Objects/Health.js` | `barricadeMul` | **0.5625** on Level 2 + Castle Tower, **0.65** elsewhere | `health` and `maxHealth *=` at Start. |
| Bees + rats HP | same | — | **×0.75** on Level 2 + Castle Tower only | Name must contain Bee (not Nest) or Rat. |
| Hive HP | `Misc Objects/BeeNest.js` | — | **×0.5** health, maxHealth, `healthDropPoint` | Then wires `DropCollectibles`. |
| Hive heart drop | same | `dropHealthItem` / `healthItemResource` | **true** / `Prefabs/Animals/Fruits/Fruit A` | Drops when hive HP hits 0. |

---

## Crashes / safety (no gameplay feel)

| File | What we did |
|---|---|
| `Audio/BounceSound.js` | Skip empty sound slots; pitch floor 0.1. Fruit bounce freeze. |
| `Audio/VelocityVolume.js` | Pitch clamp 0.05–3. |
| `Friction/ForceFriction.js` | Same pitch clamp. |
| `Animation/PlayLoopAnimation.js` | Do not read AnimationState if disabled. |
| `DestroyAfterAnimation.js` | Same. |
| `Game/Pause.js` | Null checks so Island pause works. Audio pause still original. |
| `Misc/LoadPrefabByBounds.js` | Only null-safety. Barricade respawn experiment **removed**. |

---

## How to change a number later

1. Open the file in the table.
2. Edit the **Current** variable (usually a `private var` near the top).
3. Stop Play, save, Play again.
4. Update this file’s Current column.

Rollback of the 2026-09-10 combo / stamina / hive / bounce pass: `.rollback\2026-09-10\ROLLBACK.ps1` (folder is gitignored).
