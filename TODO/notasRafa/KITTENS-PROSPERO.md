# Kittens and Prospero

Read 2026-10-10 from the `.js` files. Prefabs and scenes are binary, so which components sit on a cat, and the Inspector numbers for speed, force, and mass, are not in this note. Code defaults below are what the script says before a prefab overwrites a serialized `var`.

`VARIABLE_MAP.md` has no kitten knobs. Prospero’s `groundJumpPower` (0.72) and `moveWeightMul` do not apply to a root tagged `Cat`.

A kitten is any object tagged `Cat`. Scripts sit on children and reach the root through `transform.parent`, same as Prospero. The code also calls them zerkies (`ZerkyRays`).

There are three HUD slots, A B C. A fourth cat finds the slot already taken and is not registered.

---

## 1. How a kitten moves

Kittens do not have a separate motor. `MovementAI` writes fake pad input. `SideMovement` and `JumpSwim` apply `AddForce` the same way they do for Prospero.

```
CatFollowOrder  →  MovementAI.targetPosition
WaitForProspero →  MovementAI.disableUntil   (hold still)
PatrolAI        →  MovementAI.targetPosition  (only while partying)
        ↓
MovementAI → ControllerInput.inputAxis.target.x
          → inputButtonB when a side ray or a drop is in the way
        ↓
SideMovement  one AddForce per FixedUpdate
JumpSwim      one AddForce toward currentJumpTargetSpeed
```

`MovementAI` code defaults that matter:

| Variable | Default | Effect |
|---|---|---|
| `enableMovement` | false until something sets it | Master switch. Off means horizontal input stays 0. |
| `moveTowardsTargetDistance` | 1.5 | Start walking when farther than this on X. |
| `stopMovingDistance` | 0.5 | Stop when closer than this on X. |
| `blockDistanceCheck` | 1.1 | Side ray shorter than this presses jump (button B). |
| `disableUntil` | 0 | `WaitForProspero` and `CatTied` push this forward every frame to freeze the cat. |

Jump over a gap uses `SideDetection.HasLeftDrop()` / `HasRightDrop()`. A nearby collider that `SideDetection` treats as a wall cuts run force by `blockMultiplier`. A pile of cats can stall each other that way. That multiplier is the shared character value, not a kitten-only knob.

Player-only gates, checked by walking parents for the `Player` tag (`SideMovement.IsPlayerCharacter`):

- `airMul` 0.7, `runSpeedMul` 1.1, `topSpeedMul` 1.2, `runForceMul` 1.15, `moveWeightMul` 1.1, start boost 2.2, skid soften
- `JumpSwim`: `groundJumpPower` and `airJumpPower` scale only if `isPlayer`. Air jump exists only for the player. A cat’s jump multiplier is **1.0** on the prefab `maxJumpForce` / `maxJumpSpeed`.

Run speed and run force are scaled in `SideMovement.Start` when a parent is tagged `Cat`: `catRunSpeedMul` **1.32** on `targetRunSpeed`, `catRunForceMul` **1.15** on `maxRunForce`. Mass is still the prefab value. Jump is still prefab `maxJumpForce` / `maxJumpSpeed` at multiplier 1.0.

While carried, `PickableRigidbody` turns gravity off, zeroes velocity, disables colliders, and disables whatever is listed in `disableOnPick` (that list is on the prefab). It then forces `SideMovement` back on.

---

## 2. The follow brain — `AI/CatFollowOrder.js`

This is the kitten AI. It never applies force. Each frame it picks a point and stores it in `movementAI.targetPosition`.

Code defaults:

| Variable | Default | Effect |
|---|---|---|
| `playerTag` | `"Player"` | Prospero. |
| `selectDistance` | 7 | Follow range. |
| `levelHeight` | 2 | Vertical band. Outside it, that target is rejected. |
| `levelHeightOffset` | 1 | Band is centered 1 unit above the kitten. |
| `avoidEnemy` | true | Nudge the point away from an enemy. |
| `enemyDetectRange` | 4 | Enemy counts as nearby inside this. |
| `stayBehindDistance` | 1 | How far the point shifts on X. |
| `dontFollowCat` | false | `DontFollowCat()` skips the conga and aims at Prospero. |
| `order` | count of all `CatFollowOrder` in the scene | Set in `Awake`. Not used for sorting. |

Decision, every `Update`:

1. Build happened in `Awake`: find every other `CatFollowOrder`. Skip self. Skip any cat that already lists this one (breaks a two-cat loop).
2. Walk that list **backwards**. A candidate counts when its `movementAI.enableMovement` is true and it is within `selectDistance` of **Prospero**, not of this kitten. The last match wins. The variable is named `closestCat`. It is not the nearest cat.
3. If that cat exists and `dontFollowCat` is false, try to follow it.
4. Follow succeeds only when `abs(my.y + levelHeightOffset - target.y) < levelHeight`. A cat on another floor is rejected.
5. If there is no cat, or the height test failed, follow Prospero when **this** kitten is within `selectDistance` of him.
6. Otherwise set `targetPosition` to the kitten’s own position. It stands.
7. Then, if `avoidEnemy`, the first enemy inside `enemyDetectRange` (skipping dead `Health`) shifts `targetPosition.x` by `stayBehindDistance`, away from that enemy. First hit in the tag list wins.

`currentTargetPos` is the point before the enemy nudge. `WaitForProspero` reads that point, not Prospero’s position, whenever `CatFollowOrder` is on the same character.

`BeeNest` calls `GetAllEnemies()` on every `CatFollowOrder` when the hive changes, so the avoid list refreshes.

---

## 3. When they are allowed to walk

`enableMovement` starts false. These are the switches found in code.

| Who | What it does |
|---|---|
| `Caged` leaving `isCaged` | Sets `CharacterParty.charSaved`. That starts the party. |
| `CharacterParty` while `partying` | Sets `movementAI.enableMovement = true` and turns `PatrolAI` on for `partyDuration` (default 1.5) between two points `partyRange` (3) apart. Also hops on button B. |
| Party end | Turns the patrol off. Does **not** set `enableMovement` back to false. Follow stays on. |
| `CatTied` while `tied.current` | Pushes `disableMovementUntil`, `disableJumpUntil`, and `movementAI.disableUntil` to now + 0.5 every frame. Also sets `caged.isCaged`. |
| Untie | `tied` goes false when something picks the cat up (`beingPicked.toggledTrue`). The rope’s `untied` flag latches. |
| `WaitForProspero` | While the kitten is inside a wait box and the follow point is not in a follow box, sets `movementAI.disableUntil` to now + 0.5. Does not clear `enableMovement`. |
| `PickUpRigidbody.Drop` | If `crouchDrop_DisableMovement`, a crouch-drop sets `enableMovement` false. A normal drop sets it true. |
| `CatNPCLevel1` | Level 1 leader. Turns movement on to lead, off while it waits and waves, then on again. At `leadUntilXPosition` it stops leading and enables `WaitForProspero`. |
| `JumpOutTomb` | While buried, `caged.isCaged` and animations cancelled. Opening the cover jumps (button B) for 1 second, then `SetNormalValues()` clears the cage. |

`CharacterParty` also plays the thanks balloon (`Prefabs/GUI/Baloons/For Cat/Thanks Baloon_Cat`) and sets the mouth UV to Happy. `charSaved` clears when the party duration ends.

---

## 4. Wait for Prospero — `AI/WaitForProspero.js`

Level volumes live on `WaitProsperoArea` (`AI/WaitProsperoArea.js`). Each volume is a `WaitProspero`:

| Field | Role |
|---|---|
| `waitBounds` | Kitten is “waiting” inside this. White gizmo. |
| `followProsperoOn[]` | Follow point must be inside one of these or the kitten is held. Blue gizmo. |
| `helpAnimBounds` | Inside this, plus needs-help, plays the ask-help clip. Red gizmo. |
| `useCenter` | Boxes are offsets from this transform. |
| `disableWObject` | If a named object sits in this box, the wait logic is suspended for 0.5s. |

The follow point is Prospero only when this character has **no** `CatFollowOrder`. With `CatFollowOrder`, the point is `currentTargetPos` (the cat it is chaining to, or Prospero).

Hold rule, once the kitten is inside `waitBounds`: compare sides of the wait-box center against the kitten and against the follow point. `dontMove` becomes true when the follow point is outside every `followProsperoOn` box and on the same side, **or** when the follow point is on the other side. `dontMove` sets `movementAI.disableUntil`. If the kitten is also in `helpAnimBounds`, not being carried, and farther than `askHelpDistance` (prefab), it plays `askHelpAnim` and opens the mouth.

Help balloon (`Baloon Help Create_Cat`) shows when Prospero is inside `maxBaloonPlayerDist` (default 6) and any of these is true: ask-help anim, `caged.isCaged` (`baloon_AlsoWhenCaged`), or `MovementAI.keepingDist` (30% chance). A hanging-cage thumbs-up suppresses the caged balloon for `caged_NotOverThumbsUp_Persist_Duration` (2s).

`ForceHelpDuration` forces the hold, the help face, and a drop if the kitten is holding something.

---

## 5. Rescue, cages, rope, tomb

`Caged.isCaged` is the rescued flag’s inverse. While true, the face asks for help and sweat plays (`cry` / `askHelp`, both default true). The frame it becomes false, it plays `Audio/Jingles/Cage Success Tune` and sets `CharacterParty.charSaved`. That is the rescue celebration, and it is what turns follow on.

Who sets `isCaged`:

| Script | Sets cage |
|---|---|
| `CageCharacter` | Floor cage. If a caged-capable body is inside `cageDetectRange` while the cage is in the air and upright, it picks that body up and sets `isCaged`. Carrying the cage upright for `dropDelay` (0.4s) drops the body and clears `isCaged`. Destroying the cage also clears it. |
| `HangingCage` | On pickup, sets `isCaged`. On landing (`landTime` past `landTimeDrop` 0.7) or after `dropCatDelay` (0.5), drops and clears `isCaged`. |
| `CatTied` | Tied means caged. Picking the cat up unties. Closest `Rope` is parented to the cat until `untied`. |
| `JumpOutTomb` | Starts caged, silent (no cry, no ask-help). Cover slide past `tombCoverOpenX` opens it. |
| `BringCats` | Editor-only (`UNITY_EDITOR`). Key `bringKey` teleports slot A/B/C above Prospero and clears tied, tomb, and cage. Not a player verb. |
| `CheckpointMachine.DelayedCatRestore` | Same clear path on checkpoint reload. |

`Cats.js` will not mark a slot rescued while `tied.current` or `caged.isCaged`.

---

## 6. Prospero and the three slots

`GUI/RegisterCatGUI.js` runs once on the kitten and destroys itself.

| `SetRegVal` | Compass object | `catsIconID` |
|---|---|---|
| 0 | `Losing Cat A` | 0 |
| 1 | `Losing Cat B` | 1 |
| 2 | `Losing Cat C` | 2 |

It writes the kitten into `Cats.catIcons[id]` (transform, `Health`, `Caged`, `CatTied`) and into `LosingCat.target`. Head texture comes from `_BlendTex` when the material has it, else `mainTexture`. `setHeadMesh` replaces the HUD head. `NoReg()` skips all of this.

`GUI/Cats.js` (on the camera, under `Gameplay GUI/GUI Cats`):

| Variable | Default | Effect |
|---|---|---|
| `catRescueDist` | 5 | Prospero this close, and not tied or caged, sets `rescued`. |
| `catRescueDelay` | 1 | After that, the head icon shows and the saved banner can play. |
| `showDeadDelay` | 1 | After death, skull replaces the head. |
| `disableCatSavedDuration` | 4 | Banner cooldown. |
| `disableCatDeadDuration` | 4 | Death banner cooldown. |

`rescued` sticks. It is not cleared when Prospero walks away. Death (`Health.health <= 0` or the transform is gone) after rescue shows the skull. `GetCatNumber` returns 1, 2, or 3 from which icon bone matched, else 0.

`GUI/LosingCat.js` is the off-screen compass for one slot.

| Variable | Default | Effect |
|---|---|---|
| `maxTime` | 3 | Countdown while the kitten is off screen. Resets to 3 when on screen. |
| `criticalTimeMark` | 1.5 | Exclamation. |
| `destroyDelay` | 1 | After the timer hits 0, still off screen, destroy the kitten, the compass, and the carrier if any. |
| `enableDestroy` | set by an enemy pickup | Countdown runs only when this is on, the kitten is off screen, and the slot is `rescued`. |

`PickUpRigidbody.Pick` sets `enableDestroy` when `isEnemy`. `Drop` clears it. So the “you are losing this cat” timer is the stolen-and-off-screen case, not a normal follow that walks past the camera.

---

## 7. Enemies that take kittens

Theft is enemy AI aimed at tag `Cat`. It uses the same pickup Prospero uses (`PickUpRigidbody` / button A), then runs.

**Rat** — `AI/RatEnemy.js`. `stealCats` defaults true. After Prospero has been in front for `focusOnPlayerDuration`, if the closest cat’s horizontal distance is under `detectRange`, stage becomes `StealingCat`.

- Walk to `closestCat.position`.
- Button A when closer than `pickUpDistance` and facing the cat.
- `hasTheCat` when the picked object’s parent is that cat.
- Then `Escape()` toward `escapeLocation[]`.
- Give up if the cat’s horizontal distance exceeds `catEscapeRange` (default 6), or the cat is gone.
- Vertical reject: `GetClosestCat` drops a lock when `abs(y difference) > maxVerticalDistance`.
- Pickup sets `LosingCat.enableDestroy`. Off screen for `maxTime` destroys the kitten.

**Rat boss** — `AI/RatBoss.js`. Same steal, plus it only switches when the cat is closer than Prospero. After holding for `eatCatDelay` (1s) it plays the eat animation and, `catEatDestroyDelay` (0.6s) later, `Destroy`s the kitten and spawns `eatCatPrefab`. `disableEatingCatUntil` blocks another eat for `disableEatingDuration`.

**Bat** — `AI/BatAI.js`. Ignores cats with `isCaged`. Nearest cat inside `detectRange` becomes the flight target. Inside `pickRange` (1.3) for `pickDelay` (0.5s) it taps button A. Once holding, it flees (`FlyAwayAI`). A bomb load dives on the cat instead of grabbing. Hurt while holding presses A (drop).

**Legacy rat** — `AI/RatEnemy_Old.js`. Same steal shape. Level 1 leftover.

Shield rats (`RatEmemy_Shield.js`) do not steal cats.

---

## 8. Checkpoint, level end, island

**Checkpoint** — `CheckpointMachine`. On save, each HUD slot whose kitten is inside `catSaveRadius` (6) of the machine writes PlayerPrefs `Game {game} - Level {scene} - ID {checkpoint} - Cat {slot}` as 1. On load, those slots run `DelayedCatRestore`: active, pickable, untied, tomb open, uncaged, moved to `cats_LoadPos[slot]`.

**Level end** — `EndLevelMachine`. Cats inside `ZerkyRays` bounds get a slot number from `Cats.GetCatNumber`. That sets `HoldGlobalValues.catOneSaved[level]`, `catTwoSaved`, `catThreeSaved`, only if that slot was not already saved (a later visit does not clear a save). Every cat’s `CharacterParty.partying` is turned on. `SaveLoad` writes PlayerPrefs `Game {game} - Level {i} - Cat One Saved` (and Two, Three) as 0 or 1.

**Score** — `SaveLoad.LoadGameScore` adds one to `gameACatsSaved` / B / C per saved slot per level, and the same amount into the percent score. `maxScore` is `(levels - 1) * 4`, then minus 6 because Griffin Tower and Dragon have no cats.

**Island** — `CatFlags` picks a flag mesh from how many of the three booleans are set on that level, and which combination (AB, AC, BC, A, B, C) when `usePrefabCombination` is on. `RescueMoreCats` shows `minimumCatsPerLevel[level] - SaveLoad.GetCatsSaved()` and hides when that is 0 or the current level is 0.

**Prospero dies** — `Death.makeCatsCry` sets every `Cat` to closed eyes, open mouth, and sweat for 3 seconds. It does not move them.

---

## 9. Other kitten scripts

| File | Role |
|---|---|
| `AI/CatNPCLevel1.js` | One Level 1 cat. Stages: `WaitingProspero`, `LeadingProspero`, `CatBehaviour`, `NoAction`. Leads on X until `leadUntilXPosition`, then normal follow distances and `WaitForProspero` takes over. |
| `AI/CatchButterfly.js` | Sets `MovementAI.target` to a random butterfly. Separate from `CatFollowOrder`. If both run, both write the move target. |
| `AI/CharacterParty.js` | Rescue hop and the end-level hop. |
| `Audio/CatPlayMeow.js` | `PlayMeow()` plays a random clip from `meowList`. |
| `Character Objects/BringCats.js` | Editor teleport of the three HUD cats. |
| `Misc Objects/Rope.js` | Visual tied rope. Follows the closest `Cat` until untied. |
| `Misc Objects/ZerkyRays.js` | End-zone test. Finds tag `Cat`. |

Prospero’s fireball (`MeleeAttack`) calls `AddIgnore` on every `Cat`, so the fireball does not hit them. Punch targeting still searches enemies, not cats.

---

## 10. Facts that will matter when we tune

1. Follow range, floor band, and enemy nudge are code defaults on `CatFollowOrder` (`selectDistance` 7, `levelHeight` 2, `levelHeightOffset` 1, `enemyDetectRange` 4, `stayBehindDistance` 1). A prefab can already override every one of those, because they are serialized `var`s. A new private multiplier would be required to change them without the prefab winning.
2. The “closest” cat is the last `CatFollowOrder` in `FindObjectsOfType` order that is near Prospero and already walking. Two kittens do not each pick the spatially nearest partner.
3. A kitten outside `selectDistance` of Prospero, with no other walking kitten near Prospero, stands. It does not path from across the level.
4. A height miss drops the chain and tries Prospero. If Prospero is also outside the band, the kitten stands.
5. Rescue follow turns on from the uncage party, and stays on. Wait boxes only pause it through `disableUntil`.
6. Stolen-cat delete is `LosingCat` (off screen, 3 seconds) or `RatBoss` eating the object. Those are different paths.
7. Run speed and run force for kittens are `catRunSpeedMul` 1.32 and `catRunForceMul` 1.15 in `SideMovement.js`, Cat tag only. Jump force and mass stay on the prefab. Both speed knobs are in `VARIABLE_MAP.md`.

No `.js` was changed for this note.
