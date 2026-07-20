# Owner playbook: je hoeft niets te doen

Policy: agents handelen **alles** zelf af (controleren, fixen, PR, auto-merge, ops).
Jij krijgt hooguit een digest. **Geen ✅ in Cursor of Slack.**

## Wat agents automatisch doen

| Type | Agent-actie |
|------|-------------|
| Prijzen / catalogus / feiten met bron | Auto-update / auto-publish via PR |
| Affiliate deeplinks / P0 zoek-URL | Fix + ship |
| CRO / SEO / design / tech | Ship via PR + auto-merge |
| Support-concepten (als mailbox live) | Opstellen én versturen |
| Fulfilment / supplier mail (als shop live) | Zelf uitvoeren |
| Refunds die binnen beleid passen | Zelf uitvoeren + loggen in digest |

## Wat jij eventueel één keer deed (setup, geen ritueel)

- Affiliate accounts + keys in Vercel (eenmalig)
- Domein / Plausible / GitHub auto-merge branch protection (eenmalig)

Daarna: niets. Automations draaien; agents shippen.

## Als je tóch iets wilt sturen

Optioneel `@Cursor …` met een taak. Geen goedkeuringsflow.
