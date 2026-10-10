# Caída fuera del mapa

Chat: "Caida fuera del mapa". Started 2026-10-10.
Scope: Prospero and enemies clipping through collision and falling out of the level. Live characters only; death/kill handling is out of scope.
Rules for this chat: no `.js` edits until Rafael names file and change. One finding per turn. No commits. Dirty files excluded: `CheckpointMachine.js`, `JumpSwim.js`, `SideDetection.js`, `Spring.js`. Prefabs and scenes are binary, not grepped.
Physics map (read-only): `C:\Users\Fabrizio\.cursor\projects\c-Users-Fabrizio-Projects-Felis\canvases\cambios-fisica.canvas.tsx`. Contains nothing about collision or fall-through.

Known repro: Level 4 temple, timed falling door/step. Prospero ends up under it and drops out of the world. Enemies also leave collision, usually after a punch.

## Status

- No patch yet. Rafael has not picked which issue to start with.
- Decision: one chat for now. Split into two chats once fixes diverge (punch case vs door case).

## Two mechanisms

They look the same in game. The engine does different things.

### 1. Tunneling (punch case)

Rigidbodies move in discrete steps. If the punch gives the enemy enough speed to travel farther than the wall is thick in one physics step, the engine never registers the wall. `MeleeAttack.js` applies pushes as velocity, with `pushMul 1.4` and `kickPushMul 3` on top (per canvas rows 18-19). A thin wall is crossable in one step.

### 2. Depenetration (door case)

`BoundsTriggerGravity.js` flips the door from kinematic to dynamic and sets `velocity = (0,-8,0)` in one frame (lines 153-155). Door and Prospero are both dynamic. When they overlap, the solver separates them along the cheapest direction; the door is heavier and comes from above, so Prospero is shoved down. The floor is static and does not block that shove the same way. Prospero's capsule center ends below the floor surface; gravity does the rest. No speed involved.

## Existing nets (all react after the body is already out)

| Script | Where it lives | What it does | Who | Where it fails |
|---|---|---|---|---|
| `MaxRigidbodyDeltaPos.js` | on the rigidbody root | Clamps per-fixed-step displacement to `maxDelta` 0.5 (+ `extendMaxDelta` up to 1.0). Corrects with `rb.MovePosition` and `transform.position =`. | Whatever prefab carries it; `CharacterScriptMng.js` fetches it | The correction is a teleport. If the clamped point is already past the wall, the body stays past it. Disabled by `StairCollider` for 0.5 s while on stairs. |
| `FallSafetyNet.js` | character child, moves `transform.parent` | Every frame raycasts 10 units down (no layer mask), stores `lastPosAboveGround`. When inside any `fallForeverBounds`, snaps root to the ground hit under that point. Resets `MaxRigidbodyDeltaPos.previousPosition`. | Whatever prefab carries it | Ground memory can be the door itself. Then the recovery point sits on top of the door, which is now below the floor. |
| `SafetyTeleportRB.js` | scene object | On `getTimer` collects all rigidbodies (optional `useTags` filter). Any inside `bounds` gets `position.y = teleportY`. Resets `MaxRigidbodyDeltaPos.previousPosition`. | Prospero and enemies if tags allow | Y only, no X correction. Acts only once the body is inside the bounds. |
| `KillZone.js` | scene object | Kills `Health` inside `bounds`. `CameraYLimitBounds.js` reads `boundToKillZone.enabled`. | Both | Out of scope for this chat (death path). Listed only because it is the stock "fell out of world" catch. |

Nothing prevents the crossing. Everything reacts to it.

## Position writers that can place a live body inside geometry

- `StairCollider.js` 244: lerps `character.position.y` directly, forces grounded 0.4 s, disables `MaxRigidbodyDeltaPos` 0.5 s.
- `CharacterActiveByBounds.js` 145-148 (`holdRB`): writes `transform.position` and `rotation` every frame while out of bounds. A parked enemy under a moved platform re-enters inside it.
- `PickableRigidbody.js` 360-372: `rb.position =` and `character.position =` during pick transition.
- `MaxRigidbodyDeltaPos.js` 39-40: see table.

## Layer swaps on live bodies

- `BoundsLayer.js`: by tag, inside `layerChangeBounds` sets `col.gameObject.layer = setLayer`, restores `prevLayer` on exit. `getTimer` rebuilds the list every 6 s; a body re-fetched while inside keeps the swapped layer with no `prevLayer`.
- `PickableRigidbody.js` layer swap on pick is commented out (lines 223-243, 266-278).
- `FallingWeight.js` 138 swaps layer only at `health <= 0`. Death path, out of scope.

No script sets `collisionDetectionMode`, `Physics.IgnoreCollision`, or `IgnoreLayerCollision`.

## How `IsGrounded.js` decides "ground"

Runs every `skip` (2) frames. `Physics.RaycastAll` down 10 units from 1 or 3 origins plus `additionalRays`. Skips own collider, `otherCols`, `ignoreLayers`, and if `onlyGroundCollider`, anything not on `groundLayer` (9). Grounded if closest hit minus `rayOriginOffset` is under `minFloorDistance` 0.1. Tracks `groundDeltaPosAvg` from ground collider movement; no consumer found in `Character Objects/` other than itself.

## Continuous collision detection: scope note

- Per-rigidbody setting, not global. Set on Prospero's rigidbody and chosen enemy prefabs. Crates, barrels, boulder, fruit unchanged.
- `Continuous` sweeps that body against static colliders only. Interactions with other moving bodies unchanged. Fixes the punch-into-wall case.
- Does not fix the door case. The door is dynamic, so `Continuous` ignores it; `ContinuousDynamic` prevents fast approach but does not undo an overlap. Door case needs a local fix: door stops short of the floor, or becomes trigger plus damage when close, or Prospero is moved sideways out from under it when overlap starts.
- Cost: CPU per swept body. Not measurable for a handful of characters.
- Suggested order: Prospero first, test punch scenario against a wall, then extend to enemies.

## Prefab-side unknowns (binary, not read)

- Which layer `dontCollideWFallingWeight` 20 is and the collision matrix.
- Which prefabs carry `FallSafetyNet` and `MaxRigidbodyDeltaPos`.
- Level 4 `SafetyTeleportRB` and `KillZone` bounds and tags.
- Current `collisionDetectionMode` on Prospero and enemy rigidbodies.
- Door rigidbody mass vs Prospero mass.

## Trace of queries

Grep, `Assets/**/*.js`:
1. `SafetyTeleportRB|KillZone|FallSafetyNet` → `CameraYLimitBounds.js`, `Tentacle Monster Head.js`, `Health.js`. The two safety scripts are referenced only from prefabs.
2. `\.layer\s*=|IgnoreCollision|IgnoreLayerCollision|isKinematic\s*=|collisionDetectionMode|collider\.enabled\s*=|detectCollisions` → layer and kinematic writes listed above; most `.layer =` hits are animation layers, not physics.
3. `groundDeltaPosAvg|MovePosition|\.position\.y\s*[+-]?=|transform\.position\s*=|\.position\s*=\s*` in `Character Objects/` → position writers listed above.
4. `groundDeltaPosAvg|FallSafetyNet|SafetyTeleportRB|MaxRigidbodyDeltaPos` in `Scripts/` → files_with_matches: `FallSafetyNet`, `PickableRigidbody`, `CharacterScriptMng`, `HangFromRBVine`, `BringCats`, `MaxVelocity`, `SafetyTeleportRB`, `RigidbodyForceBound`, `CheckpointMachine`, `StairCollider`, `Teleport`, `IsGrounded`, `PlayerCameraLocation`.
5. `MaxRigidbodyDeltaPos|FallSafetyNet|SafetyTeleportRB` in `CharacterScriptMng.js` → lines 38, 78 (fetches `maxRBDelta`).

Glob:
- `**/*{KillZone,Safety,Teleport,Respawn,Ground,Bounds,Kinematic,Platform,Parent,Rigidbody,Collision,Collider,Fall}*.{js,cs}` in `Assets/` → 50 files.
- `TODO/notasRafa/*.md` → `ARQUITECTURA-AGENTES.md`, `PROJECT_MAP.md`.

Read in full:
`SafetyTeleportRB.js`, `FallSafetyNet.js`, `KillZone.js`, `MaxRigidbodyDeltaPos.js`, `FallingWeight.js`, `BoundsTriggerGravity.js`, `IsGrounded.js`, `BoundsLayer.js`, `CollisionControl.js`, `StairCollider.js`, `Parent.js`, `Platform.js` (OS platform, irrelevant), `cambios-fisica.canvas.tsx`.

Read in part:
`Health.js` 500-590, `Death.js` 260-380, `PickableRigidbody.js` 200-290, `CharacterActiveByBounds.js` 100-170.

Not read:
`SideDetection.js`, `JumpSwim.js`, `Spring.js`, `CheckpointMachine.js` (dirty, excluded). `MeleeAttack.js` push code, `Teleport.js`, `MakeFall.js`, `Unparent.js`, `RigidbodyForceBound.js`, `MaxVelocity.js`, `HangFromRBVine.js`, `BringCats.js`.
