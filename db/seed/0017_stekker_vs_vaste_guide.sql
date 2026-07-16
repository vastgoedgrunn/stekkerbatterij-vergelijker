-- Gids: stekker vs vaste thuisbatterij
insert into content_articles (title, slug, excerpt, body, status, published_at) values
  ('Stekkerbatterij of vaste thuisbatterij: wat past bij jou?', 'stekkerbatterij-vs-vaste-thuisbatterij',
   'De keuze tussen plug-and-play en een geïnstalleerd systeem. Capaciteit, installatie, kosten en wanneer je welke kiest.',
   '[{"type":"paragraph","text":"Steeds meer huishoudens kiezen voor thuisopslag. De eerste vraag is: stekkerbatterij of vaste thuisbatterij?"},{"type":"heading","text":"Stekkerbatterij (plug-and-play)"},{"type":"paragraph","text":"Je koopt online, sluit zelf aan en vergelijkt webshopprijzen. Ideaal bij gemiddeld verbruik, balkonpanelen of wanneer je zonder installateur wilt starten."},{"type":"heading","text":"Vaste thuisbatterij"},{"type":"paragraph","text":"Meer capaciteit, professionele installatie en vaak een hybride omvormer. Past beter bij warmtepomp, EV of hoog jaarverbruik. Prijs via offerte, niet via een vaste webshop-CTA."},{"type":"heading","text":"Hoe wij helpen"},{"type":"paragraph","text":"Gebruik de beslishulp of kies op de homepage je pad. Stekkermodellen vergelijken we op actuele prijzen; vaste systemen leiden naar een vrijblijvende offerte."}]'::jsonb,
   'published', now())
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  status = 'published',
  published_at = coalesce(content_articles.published_at, now());
