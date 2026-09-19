# PROJECT_MAP.md — Felis Single Source of Truth

Generated: 2026-09-08. Repo baseline: commit `f3e510c` on branch `main`.
Current project: `C:\Users\Fabrizio\Projects\Felis` · Untouched original: `C:\Users\Fabrizio\Projects\original\Felis`

**Live knobs (current numbers):** see `VARIABLE_MAP.md`. That is the short sheet of every multiplier we have been tuning.

---

## 0. Three facts that change how you work on this project

**0.1 — The gameplay code is UnityScript (`.js`), not C#.** There are 456 `.js` files under `Assets/Felis/Scripts`. The only C# in the project is editor-side tooling (`Assets/Editor/ImageEffects/*.cs`, `Assets/Editor/Steamworks.NET/*.cs`) and third-party plugins. There is no `[SerializeField]` and no `public`/`private` C# semantics. The rules that decide what appears in the Inspector are:

| Declaration | Serialized? | In Inspector? |
|---|---|---|
| `var speed : float = 5.0;` at class scope | Yes | Yes |
| `private var speed : float;` | No | No |
| `static var left = -1;` | No | No |
| Any variable declared inside a function | No | No |

**0.2 — Prefabs and scenes are binary-serialized.** Searching every asset for a script's GUID (for example `BasicAttackAI.js.meta` → `e4e83414392f65e4e8e22c402d32d8ff`) returns only the `.meta` file itself; if assets were text, every prefab using that script would reference the GUID in plain text. Consequences: prefab/scene contents cannot be read, diffed or grepped outside the Unity Editor; component lists on a prefab can only be confirmed by selecting it in the Editor; Inspector values are invisible to any file-based tooling.

**0.3 — Serialized data always beats code defaults.** For a field that already exists in a saved prefab or scene, Unity overwrites the script's initializer at load time. Editing `var airMul : float = .4;` to `.7` in the script does nothing to existing objects. This is why all tuning done so far is applied as *multipliers or guarded overrides inside `Start()`*. The one exception: a **newly added** variable is absent from the serialized data, so it does take its code default — that is why new knobs like `pushMul` work as written.

---

## 1. Original vs. current comparison

### 1.1 How to run the comparison

Prefabs, scenes and assets are binary, so a text diff only works for scripts. The reliable full-project method is a content hash comparison. This is the exact command used to produce the results below (PowerShell, from anywhere):

```powershell
$orig="C:\Users\Fabrizio\Projects\original\Felis"; $cur="C:\Users\Fabrizio\Projects\Felis"
$dirs=@("Assets","ProjectSettings")
function Map($root){ $h=@{}; foreach($d in $dirs){ $p=Join-Path $root $d
  if(Test-Path $p){ Get-ChildItem $p -Recurse -File | ForEach-Object { $h[$_.FullName.Substring($root.Length+1)]=$_ } } } $h }
$a=Map $orig; $b=Map $cur
foreach($k in $b.Keys){
  if(-not $a.ContainsKey($k)){ "ADDED    $k" }
  elseif($a[$k].Length -ne $b[$k].Length -or (Get-FileHash $a[$k].FullName -Algorithm MD5).Hash -ne (Get-FileHash $b[$k].FullName -Algorithm MD5).Hash){ "MODIFIED $k" } }
foreach($k in $a.Keys){ if(-not $b.ContainsKey($k)){ "DELETED  $k" } }
```

It compares only `Assets` and `ProjectSettings` (never `Library`, `Temp` or `obj`, which are machine-local caches) and takes about a minute over the ~365 MB of assets.

For line-level diffs of any script, git works without the file being in a repo:

```powershell
git diff --no-index --ignore-all-space `
  "C:\Users\Fabrizio\Projects\original\Felis\Assets\Felis\Scripts\Character Objects\JumpSwim.js" `
  "C:\Users\Fabrizio\Projects\Felis\Assets\Felis\Scripts\Character Objects\JumpSwim.js"
```

Since the current project is now committed in git, `git diff`/`git log` covers everything from `f3e510c` onward; the folder comparison above is only needed for changes made *before* that baseline commit.

### 1.2 Results — 4269 original files vs 4270 current

**Modified Unity assets / prefabs / scenes / ScriptableObjects: none.** Not one binary asset differs. Every gameplay change so far lives in script files, which means the original behaviour can be restored by reverting text only.

**Modified scripts (21 `.js`), grouped by intent:**

| File | Change |
|---|---|
| `Character Objects/JumpSwim.js` | Air double-jump added (`maxAirJumps`, `minTimeBetweenJumps`, `airJumpsUsed`, `jumpedUntilLand`); ground jump scaled to 80% via `groundJumpPower`; air jump at 60% of that via `airJumpPower`; jump goes straight up on slopes >12°; `maxSlopeAngle` forced to 70 |
| `Character Objects/SideMovement.js` | Air steering `airMul` 0.4→0.7 (player only); new `airRunAccelMul` 1.5; mid-air turns keep the speed ramp; skid friction softened; wall/slope stall softened (`blockMultiplier`, `slopeMultiplier`, `highSlopeRunForce`); cat-like launch — `targetRunSpeed` ×1.1, `maxRunForce` ×1.15 and a ×2.2 acceleration burst below 70% of top speed, all player only |
| `Character Objects/SideDetection.js` | `sideDetectionRange` 0.4→0.32 so the player snags less on walls |
| `Character Objects/MeleeAttack.js` | Attack power ×0.99; vertical hit reach (`verticalReachUp` 1.4, `verticalReachDown` 1.2); knockback `pushMul` 1.4 for non-bee targets, bees ×1.5625; `IsBeeTarget()` helper added. **Combo ramp:** each chained hit shortens `lastAttackDuration` by ×0.88 (floor ×0.65, and never below `applyForceTime + 0.08` or the hit would not register), reset via the existing `secondaryAttackDuration` chain window. **Rat hitbox:** `ratHitboxMul` 1.4 if the name chain contains "rat". **Bear hitbox:** `bearHitboxMul` 1.6 if it contains "bear" |
| `Character Objects/Health.js` | Scene-gated HP scaling: barricades/spikes ×0.5625 on Level 2 & Castle Tower, ×0.65 elsewhere; bees and rats ×0.75 on those two levels |
| `Character Objects/Stamina.js` | `rechargeRate` ×0.945 (was ×1.35, then ×0.7 of that) and `waitBeforeRechargeDuration` clamped to 0.25s. Regen is blocked while stamina is still dropping, so that gap — not the rate — is what a fight actually feels. The earlier +25% to starting/max stamina was removed |
| `Misc Objects/BeeNest.js` | Hive HP and `healthDropPoint` halved; `beeArray` null-safety; loop variable renamed to avoid a redeclaration. **Heart drop:** attaches a `DropCollectibles` at startup (if absent) pointing at `healthItemResource`, so the hive drops a collectible when its `Health` reaches 0 via the stock death path |
| `AI/BeeAI.js` | Bee is knocked back horizontally when it collides with the player, with a stun window and cooldown (`playerBumpRange/Speed/Force/Stun`, `bumpCooldown`); dive cadence `attackTimer.every` ×0.48 (floor 0.3s) |
| `AI/WingedFlightAI.js` | `disableUntil` gate so bee flight AI pauses during that knockback |
| `AI/BasicAttackAI.js` | Restores `enableAttack` after the post-hit disable window — it was latching off forever after the player's first punch. Now applies to **every** enemy on this script: attack gap ×0.34 (bear/rat) or ×0.48 (others), post-hit disable ×0.29, one follow-up strike per approach, `minAttackGap` floor 0.2 |
| `AI/RatEnemy.js` | `delayAttack` ×0.24 (floor 0.25s), `minAttackVelocity` ×1.6 so the rat swings while still closing in, alternating extra strike at `extraStrikeDelay` 0.27s. In the `AttackingPlayer` stage it now turns to face the player as soon as `playerDistance < playerAttackRange`, instead of only once `onTarget` **and** velocity < `stopVelocity` 0.1 — that pair of conditions was what made it shuffle without swinging |
| `AI/RatEmemy_Shield.js` | Shield rat's `attackTimer.every` ×0.24 (floor 0.25s) and `minAttackVelocity` ×1.6. Anti-stall: the attack tick is latched in `attackQueued` so it is spent on the first frame the rat can actually swing rather than lost, and `adjustHoldPosDistance` is clamped to 70% of `attackRange` so it parks inside striking distance instead of on its edge |
| `AI/RatBoss.js` | Boss `delayAttack` ×0.48 (floor 0.3s) |
| `AI/RangedAirAI.js` | Evil Eye `shootDelay` ×0.48 (floor 0.5s) |
| `Character Objects/MeleeAttackSimple.js` | Enemy melee `attackPower` ×1.3 (skipped when the root is tagged `Player`) |
| `Misc/LoadPrefabByBounds.js` | Only the `delayedMsg` null-safety guards from the crash pass. **The `BlockRespawns()` experiment was removed — it never stopped the barricades from coming back.** Respawn behaviour is back to stock: it is driven by the `Load Back If Destroyed` checkbox on each entry of `Prefab Bounds List` in the Inspector |
| `Animation/PlayLoopAnimation.js` | `GetLoopState()` guard — reading an `AnimationState` while the `Animation` component is disabled returned a dangling pointer and crashed the editor |
| `DestroyAfterAnimation.js` | Same class of crash guard before touching `normalizedTime` |
| `Audio/VelocityVolume.js` | Pitch clamped to 0.05–3.0 with a NaN check (negative/NaN pitch crashed the FMOD resampler) |
| `Audio/BounceSound.js` | **Froze the editor when the hive's fruit drop spawned.** An empty slot in the prefab's `Sound List` threw out of `Start()`, leaving the remaining `defaultPitch` entries at 0; the first bounce then set a voice to ~0 pitch, which never ends and stacks up. Now: null slots are skipped when caching pitches, playback goes through one guarded `PlayBounceSound()` (null list, null source, `Random.value == 1` overflow, pitch floored at 0.1), `Camera.main` and `soundListBig` are null-checked, and `Update()` returns early if `isGrounded` was never found |
| `Character Objects/Friction/ForceFriction.js` | Same pitch clamp on the drag sound |
| `Game/Pause.js` | Null guards around `Camera.main`, `pauseText`, `overlay`, `inventory` so Pause works on scenes without the Go Back UI. **Audio pause logic (`StopAudio`/`UnstopAudio`) is byte-for-byte original** |

> The enemy tuning multipliers above (`attackDelayMul`, `attackRateMul`, `shootDelayMul`, `attackPowerMul`, the floors) are declared `private` on purpose: UnityScript only serializes public fields, so a prefab that was saved while they were public could keep an old value and silently ignore later edits. Private keeps the value in code, where we tune it. The base numbers they scale (`delayAttack`, `attackTimer.every`, `maxTolerance`, `attackPower`) stay Inspector-exposed as before.

**Added files (1):** `Assets/Felis/Resources/Audio/Level Music/Thumbs.db` — Windows Explorer thumbnail cache, not a project asset, safe to delete.

**Deleted files: none.**

**Also changed:** `ProjectSettings/ProjectVersion.txt` — written by Unity when the project was opened with 2017.4.39f1. Not a gameplay change.

---

## 2. Gameplay architecture by system

Scripts live in `Assets/Felis/Scripts/<folder>`. A structural convention runs through the whole project: **character logic sits on child objects and reaches the character root through `transform.parent`.** Almost every character script starts with `transform.parent.GetComponentInChildren(...)` to wire itself up (`autoFindComponents`). If you look for a script on the root object you will not find it.

### 2.1 Felis / Player
Covered in depth in section 3. Core scripts: `SideMovement`, `JumpSwim`, `IsGrounded`, `SideDetection`, `ForceFriction`, `MeleeAttack`, `Health`, `Stamina`, `Hurt`, `ControllerInput`.

### 2.2 Enemies — `Assets/Felis/Scripts/AI/`

26 scripts. Enemies are composed from shared parts rather than one script per enemy: an AI "brain" plus the same movement and health components the player uses. Enemy melee is `MeleeAttackSimple` (the player uses the fuller `MeleeAttack`), and `BasicAttackAI` is the generic free-will melee decision layer.

| Brain script | Used for | Notable serialized vars |
|---|---|---|
| `RatEnemy.js` | Full rat: combat, cat theft, key stealing, bomb placing, chokepoint guarding | `detectRange`, `playerAttackRange`, `delayAttack`, `stealCats`, `stealKey`, `useBombs`, `escapeLocation[]` |
| `RatBoss.js` | Rat boss (simplified rat + cat eating) | `eatCatPrefab`, `eatCatDelay`, `raiseBackDoor`, `angryAnim` |
| `RatEnemy_Old.js` | Legacy Level 1 rat | `playerDetectRange`, `catDetectRange` |
| `RatEmemy_Shield.js` | Shield rat holding a lane | `holdPositionLocation`, `shieldDirection`, `adjustHoldPosDistance` |
| `Zombie.js` | Buried rat: rise-from-ground, then enables `RatEnemy` | `triggerZombieBounds`, `underGround`, `deleteMask` |
| `BasicAttackAI.js` | Generic ground melee (bear, wolf, crab, etc.) | `attackOnFreeWill`, `maxTolerance`, `attackRange`, `attackForce`, `disableTimeAfterHit` |
| `BatAI.js` | Bat: patrol, grab cats, drop bombs, flee | `pickRange`, `getBombRange`, `dropBombRunAwayDuration` |
| `BeeAI.js` | Bee: hover, dive attack, player bump knockback | `targetDetectRange`, `attackDistance`, `playerBumpRange`, `playerBumpForce` |
| `RangedAirAI.js` | Evil Eye: flying ranged attacker | `shootDelay`, `ammoPrefab`, `shootForceMultiplier` |
| `MovementAI.js` | Shared pathing used by every ground brain | `enableMovement`, `target`, `targetPosition`, `stopMovingDistance`, `keepEnemyDist` |
| `PatrolAI.js` / `FlyAwayAI.js` / `WingedFlightAI.js` / `EnemyKeepDistance.js` | Waypoints, fleeing, flight, spacing | `points[]`, `stayTime`, `flyArea`, `disableUntil`, `distance` |
| `ForceMovementBoundsAI.js` / `ForceInputBounds.js` | Level-authored AI constraints inside bounds | `forceMovementBounds[]`, `tags[]`, `pressA`, `pressB` |

`FlyingPatrolAI.js` and `EnemyCenter.js` are effectively stubs (`EnemyCenter` only carries `targetBone`, which `MeleeAttack` uses as the aim point).

**Prefabs** (`Assets/Felis/Resources/Prefabs/Characters/Enemies/`): `Bat Fat`, `Bat Small`, `Bear`, `Bee`, `Crab`, `Dragon`, `Evil Eye`, `Fish Monster`, `Jellyfish`, `Owl`, `Owl Small`, `Rat`, `Rat Big`, `Rat Boss`, `Tentacle Monster`, `Wolf`, `Zombie Rat`. The hive lives outside that folder at `Resources/Prefabs/Misc/Bee Nest.prefab`.

Typical compositions (inferred from code, not readable from the binary prefabs): rats use `RatEnemy` + `MovementAI` + `ControllerInput` + `MeleeAttackSimple` + the standard character stack; bear/wolf/crab-type ground enemies use `MovementAI` + `PatrolAI` + `BasicAttackAI`; bats and bees use `WingedFlight` + `WingedFlightAI` plus their own brain; the Dragon has no autonomous AI at all and is puppeteered by level scripts.

**State machine enums:** `RatAIStages` (`WaitingPlayer`, `AttackingPlayer`, `StealingCat`, `DisableAI`, `RunWithKey`, `AskForKey`, `HoldPosition`, `GettingBomb`, `PlacingBomb`), `RatBoss_Stages` and `RatLVL1Enemy_Stages` (first four of those), `RatShield_Stages` (`HoldPosition`, `DisableAI`). Bats, bees and Evil Eye use `ToggleBoolean` flags and timers instead of enums.

Identification is name- and tag-based, not type-based: enemies in general carry the `Enemy` tag, bees the `Bee` tag, and rats and bears are matched by substring on the object name (`Health.js`, `MeleeAttack.js`, `BasicAttackAI.js` all do this). **This is the weak point of every enemy-specific tweak** — `LoadPrefabByBounds` renames instances when it spawns them (strips `(Clone)`, can append an index, can override with `setName`), so a rename silently disables a name-gated rule with no error.

### 2.3 Bosses

**Rat Boss** — `AI/RatBoss.js` on `Rat Boss.prefab`. Four stages: idles at `waitingPlayerPosition` until it spots the player and plays its angry animation, chases and melees through `MovementAI` + `MeleeAttackSimple`, then after `focusOnPlayerDuration` switches to stealing the nearest cat and *eating* it after `eatCatDelay`. Death can raise a back door via `raiseBackDoor`.

**Dragon (Level 13)** — not an AI at all, but two scene-driven phases built from `ToggleBoolean` flags:
- `Levels/Level 13/LVL13_DragonControl_Cave2.js` — sleeping (Z particles) → woken by colliding with its legs → follows the player with an interpolated fly height → breathes fire via `ThrowFlame` when the player is within `fireDist`.
- `Levels/Level 13/LVL13_DragonControl_End.js` + `Levels/Level 13/EvilJar_Magic.js` — arena fight across `boundsPos[]` zones with continuous fire; the finale triggers when the player opens the Evil Jar: all `Enemy`-tagged rigidbodies are dragged in, the dragon's colliders are disabled and `ScaleJointChar` shrinks it into the jar, then victory audio, screen spiral and a load of the Island scene.

### 2.4 Map / environment / streaming

Two independent layers keep the world cheap:

**Bounds streaming — `Misc/LoadPrefabByBounds.js`.** Each `prefabBoundsList[]` entry has `loadBounds[]` (player inside → instantiate) and `destroyIfOutside[]` (player outside all of them → destroy, mark unloaded), with `loadBackIfDestroyed` deciding whether the entry may ever return and `requireGameVal` allowing a PlayerPrefs-gated spawn. On spawn, `ApplyChanges()` applies scale, materials, body proportions, `PatrolAI.points`, escape locations (`IsWorldPosition`), render queue and broadcast messages. `freeMem` triggers `Resources.UnloadUnusedAssets()` on unload — that call is what forces the garbage collection bursts seen in the editor log. *Stock behaviour — we no longer touch this.* A `BlockRespawns()` override was tried and removed: the barricades kept coming back, so whatever brings them back is not this list. To stop one for good, uncheck `Load Back If Destroyed` on its `Prefab Bounds List` entry in the Inspector.

**Distance culling — `Game/SetActiveManager.js`.** Objects register through `LoadPrefabByBounds` or `Misc/SetActiveManagerRegister.js`; within `disableOnDist` (default 15) they are `SetActive(true)`, beyond it `SetActive(false)`, and if `removeInactive` is set they are destroyed after `removeInactiveDelay` (default 5s).

Supporting pieces: `Environment/KillZone.js` (instant or `slowlyKillRate` damage inside bounds, optionally enemies only), `Misc/SafetyTeleportRB.js` (snaps rigidbodies back up if they fall through), `Misc/Teleport.js` (editor-only debug warps), `Environment/WaterWaves*.js` with `Character Objects/WaterArea.js` and `UnderWater.js`, foliage reactivity (`GrassWind`, `GrassFlow`, `GrassInteract`). There is no `MovingPlatform` script — ride-along motion is done with `Parent.js` (child follows a parent transform in `LateUpdate`), animation, or physics joints.

### 2.5 UI / HUD

**In-level HUD:** `GUI/Cats.js` is the cat-rescue HUD (three `catIcons[]`, each with the cat object, bone, skull, rescued/dead flags; proximity rescue at `catRescueDist`, spring-scaled icons, saved/dead popups), wired per level by `GUI/RegisterCatGUI.js` and assisted by `GUI/LosingCat.js` (off-screen compass arrow). `GUI/HealthGUI.js` and `GUI/StaminaGUI.js` draw the heart and stamina meters from the player's `Health` and `Stamina`. `GUI/Inventory.js` is the three-slot item wheel, `GUI/InputQuestion.js` the shared yes/no dialog prefab (`Resources/Prefabs/GUI/Popup Question`), `GUI/CinematicBands.js` the letterbox bars.

**Menus:** `Island/StartScreen.js` is the hub (13 level entries, unlock graph in `IsLevelAvailable()`, scene load), with `Island/Title.js`, `GUI/GameSelect.js` (three save slots) and the island presentation scripts (`ProsperoIsland`, `Compass`, `CatFlags`, `Hints`, `RescueMoreCats`).

**Pause — `Game/Pause.js`:** dims the screen, disables scripts and animations scene-wide except objects named in `noPauseNames`, pauses every `AudioSource` found with `FindObjectsOfType`, and offers the "go back to island?" confirm.

**Input prompt icons — this is the answer to the double-icon bug.** The art lives in `Resources/Prefabs` (`A Button Anim`, `B Button Sketch`, `DPad Anim`, `Start/Select Button Anim`, assembled into `Controller.prefab`), animated by `Controllers/ButtonPressAnimation.js` and `Controllers/DPadAnimation.js`. Which set is *visible* is decided by platform, not by input device:

1. `Game/Platform.js` detects the OS and, on mobile, forces the on-screen controller visible through `Controllers/FadeOut.js`; on desktop it hides it.
2. `Game/DisableByPlatform.js` is the actual swap mechanism — serialized `disableByPlatformGroups[]` listing `onPlatform[]` plus `enableObjs[]` / `disableObjs[]`, applied from `Platform.AdaptToPlatform()` at level load.
3. `Pause.js` collects several `"Go Back Button*"` renderers under the camera, with a comment noting "several for several platforms".

**There is no runtime gamepad-detection check anywhere.** Keyboard and joystick share the same Input Manager axis and button names. So keyboard and gamepad prompts appearing together is a `DisableByPlatform` grouping problem in prefab data (Editor work), not something fixable in script.

### 2.6 Progression / save

No save file — everything is `PlayerPrefs` **integers**, with keys built from strings at runtime. `{G}` is `HoldGlobalValues.currentGame` (0–2), `{L}` the level index, `{N}` a checkpoint ID.

| Key format | Owner | Meaning |
|---|---|---|
| `Game {G} - Current Level` | `Game/SaveLoad.js` | Last selected island level |
| `Game {G} - Level {i} - Completed` | `SaveLoad.js` | Level beaten |
| `Game {G} - Level {i} - Cat One/Two/Three Saved` | `SaveLoad.js` | Per-cat rescue |
| `Game {G} - Fireball`, `Game {G} - Wings` | `SaveLoad.js` | Power-ups owned |
| `Game {G} - Inv Slot 1/2/3` | `SaveLoad.js` | Inventory contents |
| `Game {G} - Level {L} - ID {N}` | `CheckpointMachine.js` | Checkpoint active |
| `Game {G} - Level {L} - ID {N} - Cat {i}` | `CheckpointMachine.js` | Cat saved at that checkpoint |
| `Game {G} - {saveString}` | `Misc Objects/OpenDoor.js` | Door opened |
| `Game {G} - {valueString}` / `{valueString}` | `SizeShowHide.js` | Generic visibility gate |
| `Game {G} - Level {L} - {name}` | `LoadPrefabByBounds.js` | Conditional spawn gate (read only) |

`HoldGlobalValues.js` is the `DontDestroyOnLoad` bridge holding the live copy of that state; `Game/SaveLoad.js` does the actual I/O and the save-disk blink; `Misc Objects/EndLevelMachine.js` writes completion and cat flags on level finish.

Checkpoint IDs are **not authored** — `GenerateID()` counts how many checkpoints sit further right on X, so adding one renumbers the rest.

**Death → respawn:** `Health.health` hits 0 → `Character Objects/Death.js` sets `dead.current`, disables most player scripts, plays the death pose and face frames → after `optionsDelayAfterDeath` (~1.5s) a `Popup Question` appears: **A restarts** (`SceneManager.LoadScene` on the same scene), **B returns to the Island**. On the reload, each `CheckpointMachine.Load()` reads its PlayerPrefs key and the saved one teleports the player to `player_LoadPos`, restores cats within `catSaveRadius` to `cats_LoadPos[i]`, and calls `ProsperoWakeUp.InstantWakeUp()`. There is no in-level respawn — `Death.dead` is never reset, the scene reload *is* the respawn.

### 2.7 VFX / animation

Confirmed: **legacy `Animation` component, no Mecanim anywhere in gameplay code.** The player's animation stack is `Animation/SideMovementAnimation.js` (run/skid/push weights from `SideMovement`), `Animation/JumpSwimAnimation.js` (jump/fall/land/swim/ledge), `Animation/IdleAnimation.js`, plus `Animation/PlayStillAnimation.js` for one-shots (attack, hurt, death) and `Character Objects/UVFrameGroups.js` / `FaceAnim.js` for sprite-sheet faces. Shared helpers: `Animation/PlayLoopAnimation.js`, `TriggerAnimation.js` (the general-purpose clip/sound/UV trigger used for confetti, flags and end-of-level spirals), `DestroyAfterAnimation.js`, `Animation/LimbIK.js` and `IK2D.js`, and `Animation/ListAnimWeights.js` as a debug overlay. Particles live in `Assets/Felis/Scripts/Particle Effect/**`.

Scripts that touch `AnimationState` directly: `PlayLoopAnimation`, `PlayStillAnimation`, `IdleAnimation`, `TriggerAnimation`, `DestroyAfterAnimation`, `PlayAnimation`, `ListAnimWeights`, `EndLevelMachine`, `ProsperoIsland`. That list matters because pause disables `Animation` components scene-wide, and reading an `AnimationState` from a disabled component hands back a dangling pointer that passes a null check and then kills the process. **Any new code touching `animationComponent[clip.name]` must check `animationComponent.enabled` first** — only `PlayLoopAnimation` and `DestroyAfterAnimation` are guarded so far.

### 2.8 Dependency direction (high level)

```
ControllerInput ──> SideMovement ──> ForceFriction
       │                │  ▲
       │                │  └── IsGrounded, SideDetection   (collision probes)
       ├──> JumpSwim ────┘
       └──> MeleeAttack ──> Health / Hurt / Stamina  (on the target)

MovementAI (enemies) ──> ControllerInput (simulated input) ──> same stack as above
LoadPrefabByBounds ──> spawns everything ──> SetActiveManager (culling)
CheckpointMachine <──> PlayerPrefs <──> Death (scene reload)
Pause ──> disables scripts/animations/audio scene-wide
```

---

## 3. Felis deep-dive: movement, physics and combat

### 3.1 Where the scripts are

All paths below are relative to `Assets/Felis/Scripts/`. Every one of these sits on a child of the player root and finds its siblings automatically when `autoFindComponents` is on.

| Script | Role |
|---|---|
| `Controllers/ControllerInput.js` | Reads pad/keyboard into `inputAxis`, `inputButtonA/B`, `startButton` |
| `Character Objects/SideMovement.js` | Horizontal movement: run force, acceleration ramp, skid, friction selection, facing side, air control |
| `Character Objects/JumpSwim.js` | Jump, double jump, wall jump, ledge grab, swimming, springs |
| `Character Objects/IsGrounded.js` | Ground raycasts: `isGrounded`, `mostlyGrounded`, `slopeAngle`, `floorNormal`, ground colliders |
| `Character Objects/SideDetection.js` | Side/feet/cliff raycasts: `IsLeftSideBlocked()`, `AreRightFeetBlocked()`, ledge heights |
| `Character Objects/Friction/ForceFriction.js` | Applies the friction value the movement scripts ask for, plus drag sound |
| `Character Objects/Friction/StopFrictionDrag.js` | Rigidbody drag defaults used when jumping/grabbing |
| `Character Objects/GroundAngle.js`, `Squash.js`, `SquashPhysics.js` | Body tilt and squash-and-stretch reactions |
| `Character Objects/MeleeAttack.js` | Player attacks: target search, damage, knockback, fireball |
| `Character Objects/Health.js`, `Stamina.js`, `Hurt.js` | Survivability and hit reactions |
| `Character Objects/UnderWater.js`, `WaterArea.js` | Swim state and buoyancy context |
| `Character Objects/PickUpRigidbody.js`, `Crouch.js`, `LookUp.js`, `Ride.js` | Secondary verbs |

### 3.2 Movement variables — all Inspector-exposed unless marked

**`SideMovement.js` — horizontal motion**

| Variable | Default in code | Effect |
|---|---|---|
| `maxRunForce` | 200 | Peak force pushing the player sideways |
| `targetRunSpeed` | 7.0 | Speed the ramp aims for while a direction is held |
| `minRunSpeed` | 3.0 | Speed the ramp falls back to with no input |
| `runAcceleration` | 2.0 | How fast `smoothRunSpeed` climbs on ground |
| `waterRunAcceleration` | 0.2 | Same, underwater |
| `airMul` | 0.4 → **forced to 0.7 for the player** | Fraction of run force applied while airborne |
| `airRunAccelMul` | 1.5 *(added)* | Extra acceleration while airborne, player only |
| `runSpeedMul` | 1.1 *(added)* | Scales `targetRunSpeed` at startup, player only |
| `runForceMul` | 1.15 *(added)* | Scales `maxRunForce` at startup, player only |
| `startBoostAccelMul` | 2.2 *(added)* | Ramp acceleration multiplier while below `startBoostUpTo` of top speed — the cat-like launch |
| `startBoostUpTo` | 0.7 *(added)* | Fraction of `targetRunSpeed` under which the burst applies |
| `skidRunForceMultiplier` | 0.2 → **forced to 0.35** | Run force kept while turning around |
| `skidFriction` | 3.0 → **forced to 2.2** | Friction during a skid |
| `skidVelocity` | 0.5 | Speed under which a turn is not treated as a skid |
| `standFriction` / `runFriction` | 9.0 / 4.0 | Friction standing still vs running |
| `waterHorizontalDrag` | 5.0 | Horizontal damping while swimming |
| `blockMultiplier` | 0.1 → **forced to 0.22** | Run force kept when a wall is detected ahead |
| `slopeMultiplier` | 0.7 → **forced to 0.85** | Run force kept when feet/side are blocked on a slope |
| `lowSlope` / `highSlope` | 40 / 60 | Slope angles that anchor the run-force curve |
| `lowSlopeRunForce` / `highSlopeRunForce` | 1.0 / 0.1 → **0.22** | Run force at those angles |
| `waterMultiplier` | 0.3 | Run force underwater |
| `flipDelay` | 0 | Delay before the mesh flips to the new facing |
| `maxWeightAllowed` | 0.2 | Above this combined weight of `disablingAnimations`, movement force is skipped |
| `isPlayer` | — | **`private`, not in Inspector.** Cached `IsPlayerCharacter()` result |

Methods: `IsPlayerCharacter()`, `DisableMovementFor(duration)`, `SetStandFric(f)`, `ApplySkid()`, `HasInput()`, `IsPushing()`, `SkidThisFrame()`, `SideMatchVelocity()`, `SetAnimComp()`. Force is applied once per `FixedUpdate` as `characterXAxis * runForce * -currentSide`.

**`JumpSwim.js` — vertical motion**

| Variable | Default in code | Effect |
|---|---|---|
| `maxJumpForce` | 100 | Force applied during the jump window |
| `maxJumpSpeed` | 10.0 | Target upward speed the force ramps toward |
| `jumpForceTime` | 0.1 | How long jump force is applied |
| `maxJumpTime` | 0.2 | How long the button can be held to charge |
| `longJumpMultiplier` | 2.0 | Charge bonus at full hold |
| `groundJumpPower` | 0.8 *(added)* | Scales the ground jump — this is the "80% jump height" knob |
| `airJumpPower` | 0.6 *(added)* | Air jump strength relative to the ground jump |
| `maxAirJumps` | 1 *(added)* | Number of mid-air jumps |
| `minTimeBetweenJumps` | 0.3 *(added)* | Gap before an air jump is allowed |
| `requiredGroundTime` | 0.5 | Time on the ground before a ground jump is allowed |
| `extendGroundedTime` | 0.15 | Coyote time |
| `maxSlopeAngle` | 60 → **forced to 70** | Steepest slope that still counts as jumpable ground |
| `floorNormalBias` | 0.1 | How much the jump leans along the floor normal (ignored above 12° — jump goes straight up) |
| `airDrag` | 0.2 | Horizontal damping while airborne |
| `enableWallJump` / `wallJumpMultiplier` | off / 3.0 | Wall jump |
| `enableGrabLedge`, `ledgeGrabFriction`, `ledgeGrab_VelocityReduce` | off, 2.0, 0.5 | Ledge grab |
| `swimTime`, `swimMultiplier`, `waterSurfaceDeepness`, `waterJumpOutMultiplier` | 0.3, 0.4, 0.5, 1.5 | Swimming |
| `springMul`, `useSpringVector` | 2.0 | Spring/bounce pads |
| `jumpSoundPitchRange` | (0.6, 1.0) | Random jump sound pitch |
| `currentJumpForceMul`, `currentJumpTargetSpeed` | — | **`private`, not in Inspector** |

Methods: `ApplyJump()` (decides ground vs air jump and sets `currentJumpForceMul`), `GetLastJumpTime()`, `GetJumpButtonTime()`, `JumpedThisFrame()`.

**Collision probes**

`IsGrounded.js` — `rays`, `useSingleRay`, `minFloorDistance` (0.1), `secondaryRaysOffset` (0.1), `rayOriginOffset`, `groundLayer` (9), `ignoreLayers`, `forceGroundUntil`, `forceNotGroundedUntil`. Publishes `isGrounded`, `mostlyGrounded`, `isFullyGrounded`, `slopeAngle`, `deltaAngle`, `floorNormal`, `currentGroundCollider[]`.

`SideDetection.js` — `rayDistance` (1.0), `sideDetectionRange` (0.4 → **forced to 0.32**), `horizontalBias` (0.5), `cliffEdgeRayDistance` (1.5), `cliffEdgeDetectionRange` (0.5), `dropMinDistance` (1.5), `detectRigidbodyRange` (0.6). Methods: `IsLeftSideBlocked()`, `IsRightSideBlocked()`, `AreLeftFeetBlocked()`, `AreRightFeetBlocked()`, `GetLeftDistance()`, `GetRightDistance()`.

**Combat — `MeleeAttack.js`**

| Variable | Default | Effect |
|---|---|---|
| `attackRange` | Inspector | Radius of the target search |
| `velocityIncreaseRange` | 0.2 | Extra reach proportional to player speed |
| `verticalReachUp` / `verticalReachDown` | 1.4 / 1.2 *(added)* | Vertical stretch of the hit volume |
| `pushMul` | 1.4 *(added)* | Knockback multiplier for non-bee targets |
| `pushSpeed`, `pushForce` | Inspector | Base knockback |
| `attackPowerPunch/Kick/Uppercut/PunchRun` | Inspector, **×0.99 in `Start()`** | Damage per move |
| `maxMultipleHit` | 3 | Enemies hit by one swing |
| `hitTimeSeparation` | Inspector | Delay between multi-hits |

### 3.3 Values our code overrides at runtime — read before tweaking

These guarded overrides in `Start()` exist because serialized values win over code defaults (fact 0.3). **Their side effect is that some Inspector edits are silently discarded at runtime if the value you type falls inside the guarded range.**

| Script | Guard | Inspector value that gets overridden | Becomes |
|---|---|---|---|
| `SideMovement` | `isPlayer && airMul >= 0.38 && airMul <= 0.42` | 0.38 – 0.42 | 0.7 |
| `SideMovement` | `skidRunForceMultiplier` 0.18 – 0.22 | 0.18 – 0.22 | 0.35 |
| `SideMovement` | `skidFriction` 2.8 – 3.2 | 2.8 – 3.2 | 2.2 |
| `SideMovement` | `blockMultiplier <= 0.12` | ≤ 0.12 | 0.22 |
| `SideMovement` | `slopeMultiplier <= 0.72` | ≤ 0.72 | 0.85 |
| `SideMovement` | `highSlopeRunForce <= 0.12` | ≤ 0.12 | 0.22 |
| `JumpSwim` | `maxSlopeAngle <= 61.0` | ≤ 61 | 70 |
| `SideDetection` | `sideDetectionRange` 0.38 – 0.42 | 0.38 – 0.42 | 0.32 |
| `MeleeAttack` | unconditional | `attackPower*` | ×0.99 |
| `Health` | name + scene match | barricade/spike, bee, rat HP | ×0.5625 / ×0.65 / ×0.75 |
| `Stamina` | unconditional | `rechargeRate` | ×1.5 |
| `BeeNest` | unconditional | hive HP, `healthDropPoint` | ×0.5 |
| `SideMovement` | player only, unconditional | `targetRunSpeed`, `maxRunForce` | ×1.1, ×1.15 |
| `RatEnemy` | `delayAttack > 0` | `delayAttack`, `minAttackVelocity` | ×0.24 (min 0.25s), ×1.6 |
| `RatEmemy_Shield` | `attackTimer.every > 0` | `attackTimer.every`, `minAttackVelocity` | ×0.24 (min 0.25s), ×1.6 |
| `BasicAttackAI` | all enemies; Bear/Rat get the stronger multiplier | `maxTolerance`, `maxToleranceVariation`, `disableTimeAfterHit` | ×0.34 or ×0.48 / same / ×0.29 |
| `RatBoss` | `delayAttack > 0` | `delayAttack` | ×0.48 (min 0.3s) |
| `BeeAI` | `attackTimer.every > 0` | `attackTimer.every` | ×0.48 (min 0.3s) |
| `RangedAirAI` | unconditional | `shootDelay` | ×0.48 (min 0.5s) |
| `MeleeAttackSimple` | root not tagged `Player` | `attackPower` | ×1.3 |

**Rule of thumb:** to tune one of the guarded values from the Inspector, pick a number *outside* the guarded range (e.g. set `airMul` to 0.65 rather than 0.40) and it will be respected. Anything not in this table behaves normally.

### 3.4 How to tweak values yourself, without code changes

1. Press **Play**. The player is spawned at runtime by the streaming system, so its objects only exist in the Hierarchy during play.
2. In the **Hierarchy search box**, type `t:SideMovement` (or `t:JumpSwim`, `t:MeleeAttack`, `t:Health`). This filters to objects carrying that component. Pick the one under the player.
3. Click the **padlock** at the top-right of the Inspector to pin the selection so it survives clicking in the Game view.
4. Edit the numbers and feel the change immediately.
5. **Values changed during Play mode are discarded when you stop.** Write down the ones you like. To make them permanent, set them while *not* in Play mode on the prefab or scene object, then save — or tell me the number and I will bake it into the script.
6. Do not save script edits while in Play mode. That triggers a domain reload, which abandons running coroutines and produces the `Coroutine:Finalize()` / "may only be called from main thread" console spam. Harmless, but it can also hard-crash the editor via the audio thread.

Good first knobs by intent: *floatier jump* → `maxJumpSpeed`, `groundJumpPower`; *snappier turns* → `runAcceleration`, `skidFriction`; *more air control* → `airMul`, `airRunAccelMul`; *longer reach* → `attackRange`, `verticalReachUp`; *harder shove* → `pushMul`, `pushSpeed`.

---

## 4. Known open issues

| Issue | Status |
|---|---|
| Gamepad and keyboard input prompts render simultaneously | Cause identified: prompt art is toggled by `Game/DisableByPlatform.js` groups per OS, and there is no runtime gamepad detection. Fix is prefab/Inspector work in the Editor, not script work |
| Ground jump turns less responsively than the air double jump | Reported, deliberately untouched pending testing |
| Clunkiness accelerating from a standstill, possibly ground collision | Reported, deliberately untouched pending testing |
| `Random.value * array.Length` can index out of range (several scripts) | Latent, unfixed except in `BounceSound` |
| Unclamped audio pitch in `MothWings`, `UnderWater`, `GameSelect_Cursor` | Latent FMOD crash risk, unfixed. `BounceSound` was the same bug and it **did** freeze the editor — fixed there, so these three are proven live hazards, not theory |
| Prefabs with an empty slot in an `AudioSource[]` list | `BounceSound` no longer cares, but the underlying data is still wrong on at least one `Fruit` prefab; other scripts reading sound arrays are not guarded |
| `AnimationState` accessed without an `enabled` check in `PlayStillAnimation`, `IdleAnimation`, `TriggerAnimation`, `PlayAnimation`, `EndLevelMachine`, `ProsperoIsland` | Same crash class already fixed in two other scripts; unguarded so far |
| More checkpoints | Feasible; the risk is `cats_LoadPos` being shorter than `Cats.catIcons`, which throws inside `Load()` and leaves `loading` true forever |
| `Thumbs.db` committed under `Resources/Audio/Level Music` | Junk file, safe to delete |

---

## 5. Context maintenance rule

This file is the single source of truth for project structure and for what has been changed relative to the original. Whenever gameplay scripts change:

1. Add or update the row in **1.2** describing the change.
2. If the change adds a `Start()` override or multiplier, add it to the table in **3.3** — that table is what keeps Inspector tuning predictable.
3. If a new system or script folder appears, extend **section 2**.
4. Keep the "no binary assets modified" claim honest: re-run the comparison in **1.1** after any Editor work that touches prefabs or scenes, and update **1.2** if that stops being true.
5. Record anything discovered but not fixed in **section 4** rather than leaving it in chat history.
