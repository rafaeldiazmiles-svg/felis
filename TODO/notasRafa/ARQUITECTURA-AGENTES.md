# Arquitectura de agentes — Felis

Cursor no ejecuta un YAML suelto de "ruteo". Lo que sí carga es esto:

| Qué | Dónde | Cuándo entra |
|---|---|---|
| Regla siempre | `.cursor/rules/felis-core.mdc` | Cada chat |
| Regla de scripts | `.cursor/rules/unityscript-inspector.mdc` | Si hay un `.js` de `Assets/Felis/Scripts` en contexto |
| Skills | `.cursor/skills/<nombre>/SKILL.md` | Si el pedido coincide con la description, o si la nombrás |
| Subagents | `.cursor/agents/*.md` | Si pedís "usá el subagent …" |
| Apuntes | `TODO/notasRafa/` | No los carga solos. Hay que abrirlos o `@` |
| Knobs vivos | `VARIABLE_MAP.md` (raíz del repo) | Si el skill de gameplay lo lee |
| Código | `Assets/Felis/Scripts/` | El juego. Esta arquitectura no lo modifica |

No hay `.cursor/configs/`. Un YAML ahí no lo lee Cursor. El frontmatter YAML va dentro de cada `.mdc`, `SKILL.md` y agent `.md`.

No hay `.cursor/mcp.json`. Felis no tiene base de datos. El estado está en PlayerPrefs y en escenas binarias. Un MCP de SQL no ve el juego. El editor de Unity 2017 no expone un MCP usable. GitHub ya se habla con `gh`. El filesystem ya lo tiene el agente.

## Dominios

- Gameplay: `Character Objects/`, `AI/`. Skill `felis-gameplay-tune`.
- Streaming: `Misc/LoadPrefabByBounds.js`. Skill `felis-streaming`. Subagent `streaming-reader`.
- Review: un solo `.js`. Skill `felis-review-js`.
- Mapa del repo: subagent `explore-felis` (solo lectura).
- Chequeo de un diff: subagent `verifier-felis` (solo lectura). No hay tests automáticos de gameplay.

## Consistencia

1. Gana el último mensaje tuyo, después `felis-core`, después el skill del tema.
2. Un subagent no edita. Si hace falta un cambio, vuelve al chat principal y vos lo autorizás.
3. Un chat = un dominio. Streaming no mezcla stamina.
4. Antes de crear un archivo, el agente dice path. Los análisis van a `TODO/notasRafa/`.
5. `verifier-felis` mira el diff. No reemplaza Play en Unity.

## Cómo moverte

1. Chat nuevo. Pegá `TODO/notasRafa/LoadPrefabByBounds.HANDOFF.txt` si seguís en streaming, o escribí 10 líneas del tema.
2. `@` el archivo del tema. Ejemplo: `@Assets/Felis/Scripts/Misc/LoadPrefabByBounds.js`.
3. Para auditar sin llenar este chat: "Usá el subagent streaming-reader para …" o "Usá explore-felis para …".
4. Para cambiar un número: decí el archivo, la variable y el número. Ahí aplica `felis-gameplay-tune`.
5. Para revisar sin tocar: "Review de este `.js`" → `felis-review-js`.
6. Al ~80% del anillo de contexto: "hacé handoff" → `felis-chat-handoff`, y abrís otro chat.

Los skills no aparecen como carpetas en el juego. Están al lado, en `.cursor/`, y Unity no los importa porque no están bajo `Assets/`.
