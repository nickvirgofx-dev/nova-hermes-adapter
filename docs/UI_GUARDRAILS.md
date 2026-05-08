# UI Guardrails

These guardrails exist because the dashboard layout regressed when too many cards and grid columns were added at once.

## Core Rule

Optimize for readability before density.

The dashboard is a work board, not a data wall.

## Layout Rules

### Use vertical flow by default

Safe default:

```css
.dashboardStack,
.grid {
  display: flex;
  flex-direction: column;
}
```

Avoid using multi-column grids for the main page structure.

### Text-heavy sections must be list/table style

Use list rows for:

- Active Projects
- Request Inbox
- Decision Queue
- Brain Sync
- Logs

Avoid large card grids for text-heavy content.

### Cards are allowed only for compact status

Cards are okay for:

- Health
- Pause
- Server
- Wake Log count
- Queue count

Cards are risky for:

- project descriptions
- long next actions
- documentation status
- decisions
- memory/brain notes

## Viewport Checklist

Before committing UI changes, check these states:

- 1366 x 768, sidebar visible
- 1600 x 900, sidebar visible
- 1920 x 1080, sidebar visible
- offline state
- mock preview state
- live state if backend is available

Minimum acceptance:

- no text cards squeezed into word-by-word wrapping;
- no huge empty right column;
- no important status hidden below a massive panel;
- page can be understood in 5 seconds;
- mock/live/offline state is visually obvious.

## Feature Addition Rule

Before adding a new panel, ask:

1. Does it help the user decide what to do next?
2. Can it be summarized into an existing section?
3. Is it read-only?
4. Does it work as a list row instead of a card?

If the answer to #2 or #4 is yes, do not add a new top-level panel.

## Forbidden UI Patterns in V1

Do not add:

- Run buttons
- Execute buttons
- Terminal panels
- Token forms
- Memory editors
- Remote-control panels
- Approve/reject actions that mutate queues
- File browser/editor controls

## Safe UI Patterns

Allowed:

- refresh GET status
- mock preview
- local frontend-only filter/search
- status labels
- read-only path display
- read-only risk gates
- read-only request/decision lists

## Recovery Rule

If the UI starts looking broken, do not patch individual card widths first.

First reduce information density:

1. collapse cards into list rows;
2. move less important panels lower;
3. remove duplicated metrics;
4. return to vertical flow;
5. only then tune spacing.
