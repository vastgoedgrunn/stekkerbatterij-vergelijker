# Domein & e-mail: stekkerbatterijvergelijker.com

## Vercel (domein koppelen)

1. Vercel → Project → **Settings → Domains** (al gekoppeld: apex + www).
2. Zet DNS-records bij **Mijndomein** (registrar):

| Type | Host/Naam | Waarde | Opmerking |
|------|-----------|--------|-----------|
| **A** | `@` (leeg) | `76.76.21.21` | Vercel apex, **vervang** huidige `213.249.67.10` |
| **CNAME** | `www` | `cname.vercel-dns.com` | www-subdomein |

**Alternatief:** wijzig nameservers naar `ns1.vercel-dns.com` + `ns2.vercel-dns.com` (Vercel beheert dan alles).

3. Wacht 5 tot 30 min op DNS + SSL (Vercel stuurt e-mail bij succes).

### Mijndomein: waar klikken

1. Inloggen op [mijndomein.nl](https://www.mijndomein.nl)
2. **Mijn domeinen** → `stekkerbatterijvergelijker.com` → **DNS beheren**
3. Verwijder/wijzig het **A-record** dat naar `213.249.67.10` wijst
4. Voeg A `@` → `76.76.21.21` toe
5. Voeg CNAME `www` → `cname.vercel-dns.com` toe

## Environment variables (Vercel Production)

| Variabele | Waarde |
|-----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://stekkerbatterijvergelijker.com` |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID` | `pa-0ScGRl8JclM68agzcYVvN` (uit Plausible dashboard) |

Preview/Development mogen `.vercel.app` blijven gebruiken.

## Plausible Analytics

1. [Plausible](https://plausible.io) → site `stekkerbatterijvergelijker.com` is aangemaakt.
2. Kopieer het **script-ID** uit de installatie-snippet (`pa-….js` → alleen het ID-deel).
3. Zet `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_ID` in Vercel Production (en lokaal in `.env.local` om te testen).

## Google Workspace (e-mail)

Aanbevolen adressen (al in `src/config/site.ts`):

- `info@stekkerbatterijvergelijker.com`: algemeen contact
- `support@stekkerbatterijvergelijker.com`: klantenservice / transactiemail reply-to

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
- [ ] **Supabase Auth → URL Configuration:**
  - Site URL: `https://stekkerbatterijvergelijker.com`
  - Redirect URLs: `https://stekkerbatterijvergelijker.com/**`
- [ ] Workspace MX + SPF + DKIM + DMARC
- [ ] Testmail verstuurd (Resend of Workspace SMTP)
- [ ] Homepage + `/api/health` OK op productiedomein
