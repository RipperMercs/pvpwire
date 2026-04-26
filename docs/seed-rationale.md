# Esports Org and Tournament Seed Rationale

Written 2026-04-26 by CC for PIVOT.md Step 5. Purpose: give the founder a reasoned veto pass on the recommended seed lists before authoring begins. Each pick has a one-paragraph "why this name" and a short risk note.

**Decisions locked 2026-04-26 (founder):**
1. Dissolved orgs OK to include for historical purposes (Team 3D, CLG, MAD Lions stay).
2. Esports World Cup stays in the tournament seed list; Saudi funding noted but the event is relevant to the esports tab.
3. Regional balance: expanded from 20 to 45 orgs across two batches. Founder direction is "more orgs is better"; `/esports` houses all professional teams.
4. Tournament count: expanded from 10 to 13 to close the April/May calendar gap (VCT Masters Spring), the Rocket League coverage gap (RLCS Worlds), and to add chess representation (Champions Chess Tour 2026). Chess addition also ties to founder priority on Team Liquid Chess and Magnus Carlsen.
5. Content placement (founder-confirmed):
   - `/archive` houses historical guilds and legacy editorial stories.
   - `/esports` houses all professional esports teams and tournaments.
   - `/` (home page) features the latest news and the latest currently-popular competitive games. Founder-named exemplars: Marathon, ARC Raiders, Counter-Strike, World of Warcraft.
6. Team Liquid is a priority profile. Cover all major verticals including the new chess partnership with Magnus Carlsen (March 2024). Length budget bumped to 500 to 700 words. Authoring tone is factual journalism, not promotional.

PIVOT.md Section 17 still reads "20 esports org profiles" and "8 to 12 tournament profiles." The expansions to 45 orgs and 13 tournaments are spec deviations made under the founder's "add content, more is better, refine later" direction; bump PIVOT.md Section 17 to 45 / 13 at Step 10, or note in the rolled-forward SPEC.md that the seed list overshot intentionally.

Two lists below: 45 esports orgs (4 migrated from guild profiles, 16 original tier-1 picks, 2 regional balance picks, 23 scene-depth picks) and 13 tournaments (10 original picks plus 3 added for calendar, game coverage, and chess representation).

---

## A. Esports orgs (20)

### A.1 Migrated from guild profiles (4)

These four already exist as guild profiles in `/content/guilds/`. Step 5 migrates them via `scripts/migrate-modern-orgs.mjs` into `/content/esports-orgs/` with a schema swap from `GuildFrontmatter` to `EsportsOrgFrontmatter`. Existing notable_moments and roster data preserved; era and lineage fields dropped.

1. **Fnatic** (founded 2004, UK / international). Multi-game tier-1 across CS, LoL, Dota 2, Valorant, Rainbow Six. Original Counter-Strike pedigree (Source / 1.6 / GO / 2). Mandatory inclusion; anything PvP-org-related without Fnatic looks incomplete. Risk: roster volatility 2024 to 2026 in CS; verify current LoL split status.

2. **SK Telecom T1** (founded 2002, South Korea; rebranded T1 in 2019). LoL dynasty (Faker era, four Worlds titles through 2025), now multi-game across LoL, Valorant, Dota 2, Apex Legends. Faker remains the single highest-profile esports player on the planet. Mandatory. Risk: profile should reflect current "T1" branding with "SK Telecom T1" as alias for the 2002 to 2019 era.

3. **Sentinels** (founded 2018, North America). Valorant-anchored org. TenZ era brought VCT Masters Reykjavik 2021 win and made the org NA's most-watched Valorant brand. Strong v2.0 fit because Valorant is one of the load-bearing scenes for the new home-page Live and Hot rail. Risk: minimal; modern roster well documented.

4. **Team 3D** (founded 2002, North America; defunct 2008). Early-CS-1.6 American powerhouse, multiple CPL wins. Historical relevance: bridges the OG-guild era to the modern esports-org era and gives the org index legitimate roots in NA competitive history. Risk: dissolved 2008; status should be `dissolved`. Consider whether a defunct org belongs alongside live ones in `/esports/orgs`. If the founder wants the orgs index strictly current, swap Team 3D out (see swap candidates in A.3).

### A.2 New profiles (16)

Picks emphasize: (a) currently active in tier-1 PvP scenes, (b) cross-game relevance where possible, (c) regional balance across NA, EU, KR, CN, MENA, BR, (d) recognition value to a 2026 competitive viewer.

5. **G2 Esports** (founded 2014, EU / international). Tier-1 across CS2, LoL, Valorant, Rainbow Six, Rocket League, Dota 2. The most consistent EU multi-game brand of the late 2010s and early 2020s. Mandatory; arguably should sit at #1 of the new picks. Risk: none, profile is well documented.

6. **Team Liquid** (founded 2000 NL, now international, headquartered in Utrecht and Los Angeles). One of the deepest cross-game rosters in esports. Active and recent verticals to surface on the org profile:

   - **Counter-Strike 2**: tier-1, longstanding presence
   - **League of Legends**: LCS franchise slot, perennial NA contender
   - **Valorant**: VCT Americas franchise, multi-season competitor
   - **Dota 2**: TI 2017 champion, perennial top-8, current roster
   - **Super Smash Bros Melee**: Hungrybox legacy, current Melee competitive presence
   - **Super Smash Bros Ultimate**: top-tier roster
   - **Fighting games**: Street Fighter and Tekken players across cycles
   - **Rainbow Six Siege**: longstanding LATAM-anchored R6 roster
   - **StarCraft 2**: original roots; Liquid's earliest competitive game
   - **Apex Legends**: roster across ALGS cycles
   - **PUBG, Hearthstone, Fortnite, Rocket League, FIFA / EA Sports FC, Trackmania, Quake**: depth roster across history
   - **Chess (new vertical, March 2024)**: Team Liquid Chess partnership including Magnus Carlsen as the headline signing. Direct tie-in to the existing `chess.mdx` catalog entry. Surface this prominently; chess esports is one of the load-bearing growth scenes 2024 to 2026.

   Plus the **Liquipedia** asset: Team Liquid owns Liquipedia, the most-referenced esports data wiki across all major scenes. Mention in the org profile for editorial context.

   Mandatory. Profile body should be longer than the standard 200 to 400 words to accommodate the breadth (target 500 to 700 words). Risk: comprehensiveness is the failure mode; verify each vertical against current 2026 roster status before publishing.

   **Authoring note:** the founder discloses an indie contractor relationship with Team Liquid. Profile must read as factual journalism, not promotional copy. Match the editorial tone of the G2, Fnatic, and T1 entries. Do not soften any historical roster turbulence or business issues.

7. **Cloud9** (founded 2013, North America). Tier-1 across CS2, LoL, Valorant, Apex, Rocket League. Premier NA brand. Mandatory for NA representation. Risk: 2024 to 2026 roster turnover in CS specifically; verify current.

8. **FaZe Clan** (founded 2010 NA, esports division established 2016). CS2 (won the 2022 Major), Call of Duty, Apex, Halo, Rainbow Six. Crossover content brand value beyond pure esports. Strong recognition. Risk: business turbulence in 2023 to 2024 (delisting and acquisition); confirm current org status.

9. **NAVI (Natus Vincere)** (founded 2009, Ukraine / EU). Tier-1 CS2 (s1mple legacy, current top-3 perennial), Dota 2, Apex, Valorant, Rainbow Six. The reigning CS2 brand throughout the late 2010s. Mandatory. Risk: roster shifts post-s1mple departure; verify current lineup.

10. **Astralis** (founded 2016, Denmark). The Astralis Era of CS:GO (four Majors 2018 to 2019) is one of the most-cited dynasty runs in esports history. Currently rebuilding but brand equity remains tier-1. Risk: scene presence in 2026 is mostly CS-only; profile reflects past-greatness over current-multi-game.

11. **NRG Esports** (founded 2015, NA). Currently CS2 (acquired ENCE roster lineage), Apex Legends, Rocket League, Valorant, Halo. Strong NA presence. Owners include Shaquille O'Neal and Jennifer Lopez, which gives them mainstream-press visibility. Risk: CS roster changes recently; verify.

12. **100 Thieves** (founded 2017, NA). LoL, Valorant, Call of Duty (ran 2020 LA Thieves). Significant brand outside esports as well, which fits the "PvP plus esports hub" framing. Strong NA representation. Risk: scaled back several rosters in 2024; confirm which games they currently field.

13. **Evil Geniuses (EG)** (founded 1999, NA). One of the oldest active esports brands. Multi-game across StarCraft, Dota 2 (won TI5), CS, Valorant. Historical depth plus current relevance makes EG a natural anchor for the NA section. Risk: org went through significant turmoil 2023 to 2024 (CS roster issues, restructuring); verify operating status.

14. **OG** (founded 2015, EU / international, originally Dota 2). Won The International twice (2018, 2019), the only org to do so back-to-back. Now CS2, Rainbow Six, Valorant. Required for any Dota 2 esports surface. Risk: minimal.

15. **BLG (Bilibili Gaming)** (founded 2017, China). LoL anchor (LPL contender, deep playoff runs 2023 to 2025), Valorant. Most prominent CN org currently fielding international rosters. Required for CN representation in LoL specifically. Risk: ensure profile distinguishes Bilibili Gaming the org from Bilibili the platform.

16. **Gen.G** (founded 2017, KR / NA / CN). LoL (LCK perennial, Worlds finalist), Valorant (VCT Pacific anchor), PUBG, Overwatch, Apex. Tier-1 across multiple games and three regions. Strong KR representation alongside T1. Mandatory. Risk: minimal.

17. **DRX** (founded 2012 as Korean Telecom rebranded multiple times, current name 2020). 2022 Worlds champion in LoL (Deft farewell run), now active in Valorant, Apex. Required for KR depth. Risk: 2024 LCK relegation and re-promotion arc; confirm 2026 league standing.

18. **Heroic** (founded 2016, Denmark). CS2 specialist. Top-5 CS team consistently 2022 to 2025. Adds CS-scene depth beyond NAVI/Astralis. Risk: single-game focus; if the founder wants every org to be multi-game, swap to Spirit or Vitality coverage instead.

19. **Vitality** (founded 2013, France). Tier-1 CS2 (ZywOo's home org, 2024 Major winner), LoL, Rocket League, Valorant. Leading FR brand. Mandatory for EU multi-game depth. Risk: minimal.

20. **MOUZ (mousesports)** (founded 2002, DE). Long-running CS pedigree (recent Major run 2024 to 2025), CoD, Trackmania. Well-recognized CS-scene name. Risk: scene presence is heavily CS-skewed; consider whether MOUZ or a swap-candidate gives better breadth.

### A.3 Notable absences and swap candidates

If the founder vetoes from the 16 new picks, these are the most defensible alternates:

- **Team Spirit** (RU / international, won TI 10 in Dota 2 and 2024 CS Major). Strong dual-game pedigree; would replace MOUZ or Heroic for breadth.
- **paiN Gaming** (Brazil). Most notable LATAM org currently active across LoL and CS. Adds BR / LATAM regional balance, currently underrepresented in the seed list.
- **Talon Esports** (APAC, Hong Kong / Thailand based). VCT Pacific, LoL, Apex. Adds APAC presence beyond KR.
- **Furia Esports** (Brazil). Tier-1 CS2 brand for LATAM. Alternative to paiN if the call is one Brazilian org.
- **Karmine Corp** (France). LoL EMEA and Valorant; massive crowd brand in EU. Would add a non-tier-1-historical, currently-hot pick.
- **JD Gaming** (China, LPL). Won LoL MSI 2023; major CN brand alternative or supplement to BLG.
- **LOUD** (Brazil). Won VCT Champions 2022 in Valorant; LATAM Valorant anchor.
- **Liquid Brazil / pro org** crossover candidates if Team Liquid alone covers the brand.

### A.4 Regional balance check on the 20 picks

- North America: 6 (Sentinels, Team 3D, Cloud9, FaZe, NRG, 100T, EG) plus partial T1 (KR-anchored, NA presence). Heaviest region, expected because of audience and brand recognition.
- Europe: 7 (Fnatic, G2, NAVI, Astralis, OG, Vitality, MOUZ, Heroic). Second heaviest, strong CS focus.
- Korea: 3 (T1, Gen.G, DRX). Appropriate weight given LoL and Valorant prominence.
- China: 1 (BLG). Light. Add JD Gaming or LNG in v2.1 if CN representation matters.
- LATAM: 0 in the original 20. Closed by adding Furia in A.5.
- MENA / SEA / Oceania: 0 in the original 20. APAC outside KR closed by adding Talon Esports in A.5.

Decision: per founder direction (add content rather than swap), the seed list expanded from 20 to 22 with the additions in A.5 below.

### A.5 Regional balance additions (2)

21. **Furia Esports** (founded 2017, Brazil). Tier-1 CS2 anchor for LATAM (perennial top-10 globally, signature aggressive playstyle around KSCERATO and yuurih). Also active in Valorant and Apex. Required for any seed list that claims regional coverage; Brazil is the second-largest CS audience after Russia and the largest LATAM esports market. Risk: minimal. Surface CS2 first, Valorant second.

22. **Talon Esports** (founded 2018, Hong Kong / Thailand based; currently Bangkok-headquartered). VCT Pacific franchise slot in Valorant, also active in LoL (PCS) and Apex. The most visible APAC-outside-KR org currently competing in tier-1 international circuits. Closes the SEA / Oceania gap. Risk: profile should explicitly distinguish Talon's APAC home from KR-anchored orgs to avoid conflation.

### A.6 Scene-depth expansion (23 more, founder direction "more is better")

Founder direction (2026-04-26): the `/esports` tab should house all professional teams; more is better than tight. This batch fills CN scene depth, KR depth beyond the top three, EU CS depth, NA breadth, LATAM depth, Japan, SEA, plus selectively significant historical orgs. Each entry uses the same authoring template as A.2.

**CS2 scene depth (4)**

23. **Team Spirit** (founded 2014, Russia / international). 2024 PGL CS Major champion, perennial top-3 CS team. Also Dota 2 (TI 10 winner 2021) and Apex. Risk: roster turbulence post-2024 Major; verify current.

24. **ENCE** (founded 2013, Finland). Long-running EU CS contender, 2019 IEM Katowice Major finals run is the org's signature moment. Currently rebuilding. Risk: minimal.

25. **BIG (Berlin International Gaming)** (founded 2017, Germany). Tier-1 EU CS, longest-running modern German CS org. Risk: minimal.

26. **Complexity Gaming** (founded 2003, North America). One of the oldest still-active NA esports brands. CS-anchored across two decades. Risk: roster volatility 2024 to 2026; surface as historically significant plus current contender.

**Chinese scene depth (4)**

27. **JD Gaming (JDG)** (founded 2017, China). 2023 LoL MSI champion, LPL perennial top-tier. Mandatory CN representation alongside BLG. Risk: minimal.

28. **LNG Esports** (founded 2019, China). LPL contender, Worlds qualifier perennial. Risk: minimal.

29. **TES (Top Esports)** (founded 2017, China). Multi-time LPL champion. 2020 MSI runner-up. Risk: roster shifts; verify 2026 lineup.

30. **EDG (EDward Gaming)** (founded 2013, China). 2021 LoL Worlds champion (the storybook win that broke LCK dominance). Risk: scene presence has dipped since the 2021 title; profile should frame Worlds 2021 as the centerpiece.

**Korean scene depth (3)**

31. **Hanwha Life Esports (HLE)** (founded 2018, South Korea). LCK contender, formerly ROX Tigers lineage. Risk: minimal.

32. **KT Rolster** (founded 2008, South Korea). Longest-running KR LoL org still active. Telecom-rivalry counterpart to T1 (SK Telecom T1). Historical and current depth. Risk: minimal.

33. **Dplus KIA** (founded 2017, South Korea; rebranded from DAMWON Gaming in 2021). 2020 LoL Worlds champion. Risk: minimal.

**LATAM depth (3)**

34. **paiN Gaming** (founded 2010, Brazil). LATAM multi-game anchor across LoL, CS, R6, FIFA. The longest-running tier-1 BR org. Risk: minimal.

35. **LOUD** (founded 2019, Brazil). 2022 Valorant Champions winner (the LATAM breakthrough). Also LoL, FGC, content. Risk: minimal.

36. **MIBR (Made in Brazil)** (founded 2003 originally, rebranded multiple times). Classic BR CS brand, currently active in CS2. Historical plus current. Risk: profile should clarify the multiple rebranding eras.

**Japan / SEA (2)**

37. **ZETA DIVISION** (founded 2018, Japan). Japan's flagship Valorant org (VCT Pacific franchise), also Apex and Street Fighter. Risk: minimal.

38. **Paper Rex** (founded 2020, Singapore). 2024 VCT Masters Madrid winner, 2025 Valorant Champions finalist. The most-visible SEA Valorant brand. Risk: minimal.

**EU regional brand (1)**

39. **Karmine Corp (KCorp)** (founded 2020, France). Massive EU crowd-brand phenomenon. LEC LoL, VCT EMEA Valorant, Rocket League. Often described as the "European football club" of esports. Risk: minimal.

**NA breadth (3)**

40. **TSM (Team SoloMid)** (founded 2009, North America). Longest-running NA LoL brand, also FGC, Apex Legends, Smash. Currently in transition phase post-LCS exit. Risk: confirm current league standing; profile reflects historic NA significance.

41. **OpTic Gaming** (founded 2006, North America). Call of Duty dynasty (multiple championships across CDL eras), also Halo, Valorant, Apex. The single most recognized CoD brand. Risk: minimal.

42. **SK Gaming** (founded 1997, Germany). One of the oldest still-active esports organizations in the world (predates "esports" as a term). Currently CS, LoL, FIFA, R6. Anchors the historical-depth dimension of the orgs index; founder's "dissolved orgs OK" decision plus this entry signals editorial willingness to surface long-running brands. Risk: minimal.

**Multi-game with EWC tie-in (1)**

43. **Team Falcons** (founded 2017, Saudi Arabia). Hyperactive multi-game expansion 2023 to 2025: CS2, Apex, Rocket League, Dota 2, fighting games, F1 Esports, EAFC. Tied to the Esports World Cup (Saudi-funded). Risk: profile should note the EWC tie and Saudi backing factually, matching the editorial framing decided for the EWC tournament entry.

**Historical / dissolved for archive depth (2)**

44. **Counter Logic Gaming (CLG)** (founded 2010, North America; dissolved 2024). Foundational NA LoL brand of the LCS era. Closure in 2024 marked the end of the LCS legacy-org era. Status: `dissolved`. Risk: minimal.

45. **MAD Lions** (founded 2017, intl; dissolved 2025). LEC two-time champion (2021 Spring, 2021 Summer), Worlds quarterfinalist. Closure in 2025 marked the post-LEC-franchising shakeout. Status: `dissolved`. Risk: minimal.

### A.7 Regional balance check on the 45 picks

- North America: 9 (Sentinels, Team 3D, Cloud9, FaZe, NRG, 100T, EG, TSM, OpTic, Complexity, CLG) plus partial T1 and Team Liquid (intl)
- Europe: 13 (Fnatic, G2, NAVI, Astralis, OG, Vitality, MOUZ, Heroic, Spirit, ENCE, BIG, Karmine Corp, SK Gaming, MAD Lions)
- Korea: 6 (T1, Gen.G, DRX, Hanwha Life, KT Rolster, Dplus KIA)
- China: 5 (BLG, JDG, LNG, TES, EDG)
- LATAM: 4 (Furia, paiN, LOUD, MIBR)
- Japan: 1 (ZETA DIVISION)
- SEA / Oceania: 2 (Talon, Paper Rex)
- MENA: 1 (Team Falcons)

Better balanced. Remaining gaps: Australia / NZ (no current pick), India (no current scene-anchor org). Defer both to v2.1.

---

## B. Tournaments (10 for 2026)

Picks emphasize: (a) tier-1 international relevance, (b) coverage across the load-bearing PvP scenes from PIVOT.md Section 12 (CS2, Valorant, Dota 2, LoL, fighting games, Rainbow Six, Apex), (c) calendar spread across the year so the home page Running This Week strip never has empty months.

1. **PGL Bucharest Major 2026 (CS2)**. Tier 1, international. CS Major slots are the spring CS tentpole. Use the actual confirmed organizer once the 2026 schedule is final; PGL or BLAST or ESL all rotate. If the 2026 CS Major operator is not yet confirmed at authoring time, frame as "CS2 Spring Major 2026" with TBD operator. Risk: organizer assignment may shift.

2. **League of Legends Worlds 2026**. Tier 1 international. October to November tentpole, single most-watched esports event of the year by viewership. Mandatory. Risk: minimal; confirm host region announcement.

3. **VCT Champions 2026 (Valorant)**. Tier 1, international. The Valorant year-end championship across VCT Americas, EMEA, Pacific, China. Riot has standardized the format since 2023. Mandatory. Risk: minimal.

4. **EVO 2026 (Las Vegas)**. Tier 1, international. The annual fighting-game championship across Street Fighter 6, Tekken 8, Guilty Gear Strive, Mortal Kombat 1, plus rotating titles. Holds the entire FGC together as a calendar event. Mandatory. Risk: confirm exact 2026 dates and game lineup.

5. **IEM Katowice 2026 (CS2)**. Tier 1, January to February. The traditional first major CS event of the year. Spodek arena. Mandatory CS calendar anchor. Risk: minimal.

6. **ESL Pro League Season 22 / Season 23 (CS2)**. Tier 1 league, runs twice per year. Captures the in-between-Majors competitive structure for CS2. Either season works as a seed; pick whichever lines up with the v2.0 launch window. Risk: name two separate event entries (S22 and S23) if launch window straddles them.

7. **Six Invitational 2026 (Rainbow Six Siege)**. Tier 1, international. February in Sao Paulo or Montreal. The R6 year-opener. Mandatory for R6 representation given how visible R6 is on PVPWire's existing catalog. Risk: minimal.

8. **The International 2026 (TI, Dota 2)**. Tier 1, international. October. Dota 2's annual flagship; even with the prize-pool decline post-Battle-Pass-discontinuation, TI is still the genre's defining event. Mandatory for Dota 2 representation. Risk: confirm host city (rotates).

9. **Esports World Cup 2026 (EWC, Riyadh)**. Tier 0 by prize pool (60M+ across all titles). Multi-game cross-disciplinary event. Politically controversial (Saudi-funded); editorial decision required on whether PVPWire surfaces it neutrally, with context, or skips it. Risk: high editorial sensitivity. If skipped, recommend replacing with BLAST Premier World Final 2026 (CS2) or Apex Legends Global Series Year 6 Championship.

10. **Apex Legends Global Series 2026 Championship (ALGS)**. Tier 1 BR. Year-end ALGS finals. Important because ALGS is one of the few BR esports formats that actually reads on a calendar (Fortnite is event-bursty rather than calendar-driven). Mandatory for BR representation. Risk: prize pool variance year over year; confirm 2026 numbers.

### B.1 Calendar spread check (post-additions)

- January / February: IEM Katowice (CS2), Six Invitational (R6)
- March / April / May: Spring CS Major, VCT Masters Spring 2026 (added in B.4)
- June / July / August: EVO (typically August), ESL Pro League S22, RLCS Worlds (typically late summer, added in B.4)
- September / October: League of Legends Worlds, TI (Dota 2)
- November / December: VCT Champions, ALGS Championship, EWC (date TBC)

Gap closed by adding VCT Masters Spring 2026 (April or May). RLCS Worlds adds Rocket League calendar coverage in summer. Champions Chess Tour adds chess across the year. Final count: 13 tournaments.

### B.4 Calendar, game-coverage, and chess additions (3)

11. **VCT Masters Spring 2026 (Valorant)**. Tier 1, international. April or May, host city TBC. The mid-season Valorant tentpole between regional VCT splits and VCT Champions. Closes the April / May gap in the seed calendar and gives Valorant two events on the surface (Masters plus Champions), matching CS2's two-event coverage. Risk: minimal; Riot has run Masters annually since 2021.

12. **Rocket League Championship Series 2026 World Championship (RLCS)**. Tier 1, international. Typically August. The annual RLCS year-end event. Adds Rocket League to the tournament surface, which closes one of the larger game-coverage gaps from the original 10. Risk: minimal; RLCS Worlds runs every year and is the genre-defining event.

13. **Champions Chess Tour 2026 (Chess.com)**. Tier 1 chess. Multi-event season run by Chess.com across the calendar year, typically with Division I featuring Magnus Carlsen, Hikaru Nakamura, Fabiano Caruana, and the rest of the world top 10. Adds chess to the tournament surface, ties directly to the `chess.mdx` catalog entry, and reflects the Team Liquid Chess vertical (Magnus is on Team Liquid as of March 2024). Risk: format details vary year over year; verify the 2026 schedule and divisions before authoring. Alternative if CCT scheduling is unclear at authoring time: substitute the **FIDE World Chess Championship 2026** if a cycle match is confirmed for the year, or **Norway Chess 2026** as a single-event classical chess tentpole.

### B.2 Notable absences and swap candidates

If the founder vetoes from the 10 picks, these are the most defensible alternates:

- **VCT Masters (Spring or Mid-Year)** for Valorant calendar depth.
- **MSI 2026 (LoL Mid-Season Invitational)** for LoL mid-year representation in addition to Worlds.
- **BLAST Premier World Final 2026** as a CS2 substitute if the Major operator is not confirmed.
- **Tekken World Tour Finals 2026** if EVO is too broad and a single-game FGC tentpole is preferred.
- **Capcom Cup XII / 2026** as a Street Fighter 6 specific year-end event.
- **TwitchCon Rivals 2026** if the founder wants a more streaming-creator-flavored tournament series.
- **Call of Duty League Championship 2026 (CDL Champs)**. Surfaces CDL given Call of Duty is in the catalog.
- **Halo Championship Series Worlds 2026** if Halo Infinite needs representation.

### B.3 Game coverage check on the 12 picks

Games covered: CS2 (3 events), Valorant (2: Masters + Champions), LoL (1), Dota 2 (1), fighting games (1, EVO multi-title), Rainbow Six (1), Apex Legends (1), Rocket League (1), multi-game (1, EWC). Nine scenes covered.

Remaining gaps: no dedicated event for Marvel Rivals, Overwatch 2, Call of Duty, PUBG, Hearthstone or any card game. CoD (CDL Champs) and Marvel Rivals tournaments are the most defensible v2.1 additions if game coverage stays a priority.

---

## C. Process notes for CC

When CC starts authoring in Step 5:

1. Author the 4 migrations first (Fnatic, T1, Sentinels, Team 3D). The schema-transform script handles most of it; verify each result reads correctly.
2. Author the 41 net new orgs in regional batches so the surface populates with balanced coverage as it grows. Suggested batch order:
   - **Tier-1 EU CS / multi-game (6):** G2, NAVI, Astralis, Vitality, MOUZ, Heroic
   - **Tier-1 NA (5):** Cloud9, FaZe, NRG, 100T, EG
   - **Tier-1 KR (2):** Gen.G, DRX
   - **Tier-1 international Dota / multi (1):** OG
   - **Tier-1 CN (1):** BLG
   - **Regional balance (2):** Furia, Talon
   - **CN scene-depth (4):** JDG, LNG, TES, EDG
   - **KR scene-depth (3):** Hanwha Life, KT Rolster, Dplus KIA
   - **EU CS scene-depth (4):** Spirit, ENCE, BIG, Complexity
   - **LATAM scene-depth (3):** paiN, LOUD, MIBR
   - **Japan / SEA (2):** ZETA DIVISION, Paper Rex
   - **EU regional brand (1):** Karmine Corp
   - **NA breadth (3):** TSM, OpTic, SK Gaming
   - **EWC tie-in (1):** Team Falcons
   - **Historical / dissolved (2):** CLG, MAD Lions
3. Per-org body length target: 200 to 400 words for tier-1 picks, 150 to 300 for scene-depth picks. Team Liquid gets 500 to 700 (Section A.2 #6). Each profile mentions founding year, primary games, signature title or era, current relevance, and roster handles only when high-recognition (Faker, ZywOo, s1mple, Magnus, etc.).
4. Author the 13 tournaments in chronological 2026 order so the calendar surface populates correctly from the start.
5. Per-tournament body length target: 150 to 300 words. Include format, prize pool USD, dates, location, broadcast links, and a one-paragraph "why it matters in 2026."
6. **Step 6 reminder for catalog rework:** the four founder-named home-page exemplars (Marathon, ARC Raiders, Counter-Strike, World of Warcraft) must receive `trending: true` and a hand-written `current_meta_note`. WoW specifically deserves a meta note that surfaces its current PvP scene (arena, RBG, BG blitz) since the audience may not associate WoW with 2026 competitive PvP without prompting.

---

## D. Locked decisions and remaining open items

### D.1 Locked 2026-04-26

1. Dissolved orgs are kept for historical purposes (Team 3D, CLG, MAD Lions stay).
2. Esports World Cup stays. Editorial framing should note Saudi funding factually without taking a side.
3. Org count: 45 (4 migrated, 16 tier-1, 2 regional balance, 23 scene-depth). Founder direction is "more is better"; v2.1 may add Australia / NZ and India anchors.
4. Tournament count: 13, adding VCT Masters Spring 2026, RLCS 2026 World Championship, and Champions Chess Tour 2026.
5. Team Liquid is a priority profile. Cover all major verticals including the new chess partnership with Magnus Carlsen (March 2024). Length budget bumped to 500 to 700 words. Authoring tone is factual journalism, not promotional, regardless of the founder's contractor relationship.
6. Content placement: `/archive` for historical guilds and legacy stories, `/esports` for all professional teams, `/` for latest news plus latest currently-popular competitive games. Founder-named home-page exemplars: Marathon, ARC Raiders, Counter-Strike, World of Warcraft. These four games specifically must have `trending: true` and a strong `current_meta_note` set in Step 6 of the migration.

### D.2 Still open (not blocking authoring)

- Game coverage gaps in tournaments: CoD (CDL Champs), Marvel Rivals, Overwatch 2, PUBG, Halo (HCS Worlds). v2.1 candidates.
- The 4 migrated guild profiles (Fnatic, T1, Sentinels, Team 3D) need a clean schema-transform pass; verify no data loss after the migration script runs.
- Australia / NZ scene anchor (ORDER, Mindfreak) and India scene anchor (Velocity Gaming, S8UL) are unfilled; defer to v2.1.
- PIVOT.md Section 17 still says "20 esports org profiles" and "8 to 12 tournament profiles." Now at 45 / 13. Bump Section 17 either now or at Step 10.
