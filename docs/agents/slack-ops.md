# Slack: digests only (geen goedkeuringen)

Owner policy: **hands-off.** Agents controleren, fixen en shippen zelf.
Slack is alleen nieuws. **Geen 🔒. Geen "✅ nodig". Geen actievragen.**

## Kanaal

| Kanaal | Doel |
|--------|------|
| `#all-stekkerbatterij-vergelijker` (`C0BHETBV3EY`) | Digests, alerts, PR-links |

## Agent-regels

- Post een korte digest na een run (wat veranderde, PR-link, CI).
- **Verboden:** 🔒-berichten, "reageer ✅", "wacht op goedkeuring", Cursor-✅ vragen.
- Als iets niet kan (geen bron, integratie mist): noteer het en probeer volgende run opnieuw
  of open een fix-PR. Vraag de owner niets.

## Digest-sjabloon

```
📊 Stekkerbatterij: <afdeling> update

✅ Gedaan
• …
• PR: https://github.com/.../pull/XX (auto-merge)

ℹ️ Let op (geen actie voor jou)
• …
```

## Alerts (P0)

Alleen bij site-down / deploy-fail: korte alert + wat de agent al deed (rollback, issue, fix-PR).
Nog steeds geen ✅ vragen.
