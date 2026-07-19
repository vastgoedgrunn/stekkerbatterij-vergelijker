-- Nieuwe gidsen (juli 2026) + cover via public/images/guides/<slug>.png
insert into content_articles (title, slug, excerpt, body, status, published_at) values
  (
    'Hoeveel kWh stekkerbatterij heb je nodig?',
    'hoeveel-kwh-stekkerbatterij',
    'Van avondverbruik tot uitbreiden: zo kies je een realistische capaciteit zonder te overdimensioneren.',
    '[
      {"type":"paragraph","text":"Te klein en je mist besparing. Te groot en je betaalt voor capaciteit die je zelden vol krijgt. Deze gids helpt je een realistische kWh-keuze maken."},
      {"type":"heading","text":"Begin bij je avondverbruik"},
      {"type":"paragraph","text":"Kijk hoeveel stroom je typisch tussen zonnepiek en slapengaan gebruikt. Dat is vaak de bandbreedte die een stekkerbatterij als eerste moet dekken: lampen, TV, koelkast, laptop en koken."},
      {"type":"heading","text":"Ruwe vuistregels"},
      {"type":"paragraph","text":"Eenpersoons of klein appartement: vaak 1 tot 2 kWh als start. Gezin zonder warmtepomp: vaak 2 tot 5 kWh. Warmtepomp of EV thuisladen vraagt meestal meer, of een vaste thuisbatterij in plaats van alleen plug-and-play."},
      {"type":"heading","text":"Uitbreidbaar kopen"},
      {"type":"paragraph","text":"Twijfel je? Kies een systeem dat je later met modules kunt uitbreiden. Zo test je eerst of de sturing en het gebruik bij je passen, zonder meteen te maxen."},
      {"type":"heading","text":"Volgende stap"},
      {"type":"paragraph","text":"Gebruik de beslishulp voor een richting, en vergelijk daarna capaciteit, vermogen en garantie in onze catalogus."}
    ]'::jsonb,
    'published',
    now()
  ),
  (
    'Stekkerbatterij installeren: checklist zonder gedoe',
    'stekkerbatterij-installeren',
    'Wat je checkt vóór aanschaf, hoe je veilig aansluit en wanneer je wél een elektricien inschakelt.',
    '[
      {"type":"paragraph","text":"Plug-and-play betekent: meestal geen installateur nodig. Wel even voorbereiden, zodat je veilig en binnen de regels blijft."},
      {"type":"heading","text":"Voor je bestelt"},
      {"type":"paragraph","text":"Check of je een vrij stopcontact hebt op een droge, vorstvrije plek met genoeg ventilatie. Meet of het apparaat past (diepte en gewicht). Lees de IP-waarde als je buiten of op het balkon plaatst."},
      {"type":"heading","text":"Aansluiten"},
      {"type":"paragraph","text":"Volg de handleiding van de fabrikant. Gebruik het meegeleverde snoer, overbelast geen stekkerdozen en houd afstand tot brandbare materialen. Koppel daarna de app en controleer of laden en ontladen zichtbaar zijn."},
      {"type":"heading","text":"Wanneer hulp inschakelen"},
      {"type":"paragraph","text":"Twijfel over je groepenkast, wil je vaste bekabeling, of combineer je met een warmtepomp of vaste batterij? Schakel dan een erkende installateur in. Voor een vaste thuisbatterij is dat standaard."},
      {"type":"heading","text":"Klaar?"},
      {"type":"paragraph","text":"Vergelijk daarna modellen op garantie, vermogen en actuele aanbieders, of start met de beslishulp."}
    ]'::jsonb,
    'published',
    now()
  ),
  (
    'Stekkerbatterij zonder zonnepanelen: heeft dat zin?',
    'stekkerbatterij-zonder-zonnepanelen',
    'Ja, vooral met een dynamisch contract. Zo werkt laden vanaf het net en wanneer het wél of niet loont.',
    '[
      {"type":"paragraph","text":"Een stekkerbatterij wordt vaak met zonnepanelen gecombineerd, maar dat is geen harde eis. Zonder panelen kan opslag alsnog helpen."},
      {"type":"heading","text":"Laden vanaf het net"},
      {"type":"paragraph","text":"Met een dynamisch energiecontract laadt de batterij wanneer stroom goedkoop is (vaak ''s nachts) en levert terug of gebruikt thuis wanneer prijzen hoger liggen."},
      {"type":"heading","text":"Wanneer het wél zinvol is"},
      {"type":"paragraph","text":"Je hebt een dynamisch contract of duidelijke piekuren, je wilt piekverbruik dempen, of je plant zonnepanelen later en wilt nu al wennen aan sturing via de app."},
      {"type":"heading","text":"Wanneer het minder loont"},
      {"type":"paragraph","text":"Bij een vast laag tarief zonder grote prijsverschillen is de besparing kleiner. Reken dan eerst met je echte verbruikspatronen voordat je een grote capaciteit koopt."},
      {"type":"heading","text":"Vergelijk slim"},
      {"type":"paragraph","text":"Kies een model met goede app-sturing en bekijk onze gids over dynamische contracten. Daarna vergelijk je concrete stekkerbatterijen op capaciteit en garantie."}
    ]'::jsonb,
    'published',
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  status = 'published',
  published_at = coalesce(content_articles.published_at, excluded.published_at);
