# Risk Gates

Nova Hermes Adapter starts as a read-only UI experiment.

## Blocked By Default

- Command execution.
- Terminal control.
- Local file writes.
- Memory promotion.
- Discord/GitHub/Vercel/Composio automation.
- Public remote access to the user's machine.
- Queue item execution.

## Required Before Any Write Capability

Do not implement this until explicitly approved by the user.

Minimum gates:

- `PAUSE_NOVA` kill switch check.
- Command allowlist.
- Risk classifier.
- Human confirmation for medium/high-risk work.
- Append-only audit log.
- Dry-run first for file/Git/runtime operations.
- Secret redaction in logs.

## Stop Rule

If a change needs tokens, terminal control, file writes, or remote access to be useful, stop and write a proposal instead.
