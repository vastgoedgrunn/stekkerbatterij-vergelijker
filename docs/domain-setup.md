# Domein & e-mail — stekkerbatterijvergelijker.com

## Vercel (domein koppelen)

1. Vercel → Project → **Settings → Domains**
2. Voeg toe: `stekkerbatterijvergelijker.com` en `www.stekkerbatterijvergelijker.com`
3. Zet DNS-records bij je registrar (Vercel toont de exacte waarden):

| Type | Naam | Waarde |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

4. Wacht op SSL-provisioning (automatisch).

## Environment variables (Vercel Production)

| Variabele | Waarde |
|-----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://stekkerbatterijvergelijker.com` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `stekkerbatterijvergelijker.com` |

Preview/Development mogen `.vercel.app` blijven gebruiken.

## Plausible Analytics

1. [Plausible](https://plausible.io) → Add site → `stekkerbatterijvergelijker.com`
2. Zelfde domein in `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (Production env).

## Google Workspace (e-mail)

Aanbevolen adressen (al in `src/config/site.ts`):

- `info@stekkerbatterijvergelijker.com` — algemeen contact
- `support@stekkerbatterijvergelijker.com` — klantenservice / transactiemail reply-to

### DNS voor betrouwbare bezorging

| Type | Host | Doel |
|------|------|------|
| MX | `@` | Google Workspace MX-records |
| TXT | `@` | SPF: `v=spf1 include:_spf.google.com ~all` |
| TXT | `google._domainkey` | DKIM (van Google Admin) |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:info@stekkerbatterijvergelijker.com` |

### Resend (transactiemail, optioneel)

Als je Resend gebruikt i.p.v. Workspace SMTP:

1. Voeg domein toe in Resend dashboard
2. Zet DKIM/SPF-records die Resend aanlevert
3. `RESEND_API_KEY` + `EMAIL_FROM=info@stekkerbatterijvergelijker.com` in Vercel

## Canonical URLs

De site leest de basis-URL uit `NEXT_PUBLIC_SITE_URL`. Na domein-migratie:

- Sitemap, Open Graph en structured data wijzen automatisch naar het nieuwe domein
- Oude `.vercel.app`-URL blijft werken maar is niet canonical

## Checklist

- [ ] DNS apex + www naar Vercel
- [ ] Production env vars gezet
- [ ] Plausible site aangemaakt
- [ ] Workspace MX + SPF + DKIM + DMARC
- [ ] Testmail verstuurd (Resend of Workspace SMTP)
- [ ] Homepage + `/api/health` OK op productiedomein
