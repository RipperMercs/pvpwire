// Layered SVG illustration: a castle on the horizon with magic forests and a
// road climbing to the gate. All colors driven by CSS variables so the scene
// adapts to the day/night theme.

export function CastleScene({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--scene-sky-top)" />
          <stop offset="60%" stopColor="var(--scene-sky-mid)" />
          <stop offset="100%" stopColor="var(--scene-sky-bottom)" />
        </linearGradient>

        <radialGradient id="cs-moon-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--scene-glow)" stopOpacity="0.4" />
          <stop offset="40%" stopColor="var(--scene-glow)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--scene-glow)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="cs-castle-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--scene-glow)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--scene-glow)" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="cs-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--scene-mist)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--scene-mist)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--scene-mist)" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="cs-road" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="var(--scene-road)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--scene-road)" stopOpacity="0.85" />
        </linearGradient>

        <symbol id="cs-pine" viewBox="0 0 20 40">
          <path d="M 10 0 L 4 14 L 8 14 L 2 26 L 7 26 L 0 38 L 20 38 L 13 26 L 18 26 L 12 14 L 16 14 Z" />
        </symbol>

        <symbol id="cs-pine-far" viewBox="0 0 14 26">
          <path d="M 7 0 L 3 9 L 5 9 L 1 17 L 4 17 L 0 25 L 14 25 L 10 17 L 13 17 L 9 9 L 11 9 Z" />
        </symbol>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#cs-sky)" />

      {/* Stars */}
      <g fill="var(--scene-glow)" style={{ opacity: 'var(--scene-stars-opacity)' }}>
        <circle cx="80" cy="60" r="0.9" />
        <circle cx="200" cy="120" r="1.2" />
        <circle cx="320" cy="50" r="0.7" />
        <circle cx="450" cy="110" r="1" />
        <circle cx="560" cy="60" r="0.6" />
        <circle cx="680" cy="140" r="1.1" />
        <circle cx="780" cy="80" r="0.8" />
        <circle cx="920" cy="130" r="1.2" />
        <circle cx="1040" cy="60" r="0.7" />
        <circle cx="1140" cy="200" r="0.5" />
        <circle cx="1280" cy="60" r="0.9" />
        <circle cx="1500" cy="140" r="0.8" />
        <circle cx="1560" cy="60" r="0.6" />
        <circle cx="150" cy="240" r="0.5" />
        <circle cx="380" cy="220" r="0.6" />
        <circle cx="600" cy="280" r="0.5" />
        <circle cx="1200" cy="280" r="0.5" />
        <circle cx="1450" cy="240" r="0.6" />
        <circle cx="240" cy="340" r="0.4" />
        <circle cx="500" cy="340" r="0.5" />
        <circle cx="1340" cy="340" r="0.5" />
        <circle cx="120" cy="180" r="0.5" />
        <circle cx="1490" cy="280" r="0.5" />
      </g>

      {/* Moon, upper right, behind the castle's empty sky */}
      <g transform="translate(1280, 180)">
        <circle r="160" fill="url(#cs-moon-halo)" />
        <circle r="44" fill="var(--scene-moon)" />
        <circle cx="-12" cy="-8" r="6" fill="var(--scene-moon-shadow)" opacity="0.45" />
        <circle cx="14" cy="6" r="4" fill="var(--scene-moon-shadow)" opacity="0.4" />
        <circle cx="-5" cy="18" r="3" fill="var(--scene-moon-shadow)" opacity="0.35" />
        <circle cx="20" cy="-14" r="2" fill="var(--scene-moon-shadow)" opacity="0.3" />
      </g>

      {/* Soft halo behind the castle */}
      <circle cx="780" cy="540" r="180" fill="url(#cs-castle-halo)" />

      {/* Mist band over the horizon, behind the forest and castle */}
      <rect x="0" y="540" width="1600" height="140" fill="url(#cs-mist)" />

      {/* Ground: gentle rolling horizon with a flat plateau under the castle.
          The plateau matches the castle base (y=622) from x=620 to x=990 so the
          outer towers and curtain walls have solid ground beneath them. */}
      <path
        d="
          M 0 640
          C 200 638, 380 642, 540 638
          C 580 632, 610 622, 620 622
          L 990 622
          C 1000 622, 1030 632, 1070 638
          C 1230 642, 1400 638, 1600 640
          L 1600 900
          L 0 900
          Z
        "
        fill="var(--scene-mid)"
      />

      {/* Castle silhouette - medium scale, sits on the horizon.
          Castle base at y=622, top of central keep at y=472, upper turret to y=448.
          Total width about 280px, total height about 174px. */}
      <g fill="var(--scene-castle)">
        {/* Outer left watchtower */}
        <rect x="660" y="552" width="32" height="70" />
        <rect x="660" y="546" width="8" height="6" />
        <rect x="672" y="546" width="8" height="6" />
        <rect x="684" y="546" width="8" height="6" />

        {/* Left curtain wall */}
        <rect x="692" y="580" width="48" height="42" />
        <rect x="694" y="574" width="8" height="6" />
        <rect x="708" y="574" width="8" height="6" />
        <rect x="722" y="574" width="8" height="6" />
        <rect x="732" y="574" width="8" height="6" />

        {/* Inner left drum tower */}
        <rect x="740" y="520" width="34" height="102" />
        <rect x="740" y="514" width="8" height="6" />
        <rect x="752" y="514" width="8" height="6" />
        <rect x="764" y="514" width="8" height="6" />

        {/* Central keep */}
        <rect x="774" y="478" width="68" height="144" />
        <rect x="774" y="472" width="10" height="6" />
        <rect x="788" y="472" width="10" height="6" />
        <rect x="802" y="472" width="10" height="6" />
        <rect x="816" y="472" width="10" height="6" />
        <rect x="830" y="472" width="10" height="6" />
        {/* Upper turret on the keep */}
        <rect x="790" y="450" width="36" height="22" />
        <rect x="790" y="444" width="8" height="6" />
        <rect x="802" y="444" width="8" height="6" />
        <rect x="816" y="444" width="8" height="6" />

        {/* Inner right drum tower */}
        <rect x="842" y="520" width="34" height="102" />
        <rect x="842" y="514" width="8" height="6" />
        <rect x="854" y="514" width="8" height="6" />
        <rect x="866" y="514" width="8" height="6" />

        {/* Right curtain wall */}
        <rect x="876" y="580" width="48" height="42" />
        <rect x="878" y="574" width="8" height="6" />
        <rect x="890" y="574" width="8" height="6" />
        <rect x="902" y="574" width="8" height="6" />
        <rect x="912" y="574" width="8" height="6" />

        {/* Outer right watchtower */}
        <rect x="924" y="552" width="32" height="70" />
        <rect x="924" y="546" width="8" height="6" />
        <rect x="936" y="546" width="8" height="6" />
        <rect x="948" y="546" width="8" height="6" />

        {/* Forward barbican / gatehouse */}
        <rect x="780" y="600" width="56" height="22" />
        <rect x="780" y="594" width="8" height="6" />
        <rect x="794" y="594" width="8" height="6" />
        <rect x="808" y="594" width="8" height="6" />
        <rect x="822" y="594" width="8" height="6" />
      </g>

      {/* Pennants */}
      {/* Central keep, big flag */}
      <line x1="808" y1="444" x2="808" y2="412" stroke="var(--scene-castle)" strokeWidth="1.5" />
      <path d="M 808 416 L 836 425 L 808 434 Z" fill="var(--scene-pennant)" />
      {/* Inner drum towers */}
      <line x1="757" y1="514" x2="757" y2="490" stroke="var(--scene-castle)" strokeWidth="1.2" />
      <path d="M 757 493 L 776 500 L 757 507 Z" fill="var(--scene-pennant)" opacity="0.9" />
      <line x1="859" y1="514" x2="859" y2="490" stroke="var(--scene-castle)" strokeWidth="1.2" />
      <path d="M 859 493 L 878 500 L 859 507 Z" fill="var(--scene-pennant)" opacity="0.9" />
      {/* Outer watchtowers */}
      <line x1="676" y1="546" x2="676" y2="526" stroke="var(--scene-castle)" strokeWidth="1" />
      <path d="M 676 528 L 690 533 L 676 538 Z" fill="var(--scene-pennant)" opacity="0.75" />
      <line x1="940" y1="546" x2="940" y2="526" stroke="var(--scene-castle)" strokeWidth="1" />
      <path d="M 940 528 L 954 533 L 940 538 Z" fill="var(--scene-pennant)" opacity="0.75" />

      {/* Lit windows */}
      <g fill="var(--scene-window)">
        {/* Outer left tower */}
        <rect x="668" y="568" width="4" height="9" opacity="0.85" />
        <rect x="680" y="585" width="4" height="9" opacity="0.7" />
        <rect x="668" y="602" width="4" height="9" opacity="0.6" />

        {/* Left wall */}
        <rect x="704" y="595" width="4" height="8" opacity="0.7" />
        <rect x="722" y="595" width="4" height="8" opacity="0.65" />

        {/* Inner left drum tower */}
        <rect x="748" y="535" width="5" height="11" opacity="0.9" />
        <rect x="760" y="535" width="5" height="11" opacity="0.7" />
        <rect x="748" y="558" width="5" height="11" opacity="0.85" />
        <rect x="760" y="582" width="5" height="11" opacity="0.7" />
        <rect x="748" y="605" width="5" height="11" opacity="0.6" />

        {/* Central keep, multiple floors */}
        <rect x="804" y="458" width="6" height="9" opacity="0.95" />
        <rect x="784" y="490" width="6" height="12" opacity="0.95" />
        <rect x="800" y="490" width="6" height="12" opacity="0.85" />
        <rect x="818" y="490" width="6" height="12" opacity="0.95" />
        <rect x="784" y="518" width="6" height="12" opacity="0.85" />
        <rect x="818" y="518" width="6" height="12" opacity="0.7" />
        <rect x="800" y="546" width="6" height="12" opacity="0.85" />
        <rect x="818" y="546" width="6" height="12" opacity="0.7" />
        <rect x="784" y="574" width="6" height="12" opacity="0.65" />
        <rect x="818" y="574" width="6" height="12" opacity="0.85" />

        {/* Inner right drum tower */}
        <rect x="850" y="535" width="5" height="11" opacity="0.7" />
        <rect x="862" y="535" width="5" height="11" opacity="0.85" />
        <rect x="850" y="558" width="5" height="11" opacity="0.65" />
        <rect x="862" y="582" width="5" height="11" opacity="0.85" />
        <rect x="850" y="605" width="5" height="11" opacity="0.6" />

        {/* Right wall */}
        <rect x="892" y="595" width="4" height="8" opacity="0.65" />
        <rect x="910" y="595" width="4" height="8" opacity="0.7" />

        {/* Outer right tower */}
        <rect x="932" y="568" width="4" height="9" opacity="0.7" />
        <rect x="944" y="585" width="4" height="9" opacity="0.85" />
        <rect x="932" y="602" width="4" height="9" opacity="0.6" />
      </g>

      {/* Castle gate: dark arched recess in the barbican */}
      <path
        d="M 802 622 L 802 608 Q 802 600, 808 600 L 808 600 Q 814 600, 814 608 L 814 622 Z"
        fill="var(--scene-gate)"
      />

      {/* Distant forest line on the horizon */}
      <g fill="var(--scene-forest-far)">
        <use href="#cs-pine-far" x="40" y="615" width="14" height="22" />
        <use href="#cs-pine-far" x="80" y="620" width="12" height="20" />
        <use href="#cs-pine-far" x="125" y="615" width="14" height="22" />
        <use href="#cs-pine-far" x="170" y="622" width="12" height="20" />
        <use href="#cs-pine-far" x="220" y="618" width="14" height="22" />
        <use href="#cs-pine-far" x="280" y="624" width="12" height="20" />
        <use href="#cs-pine-far" x="340" y="620" width="14" height="22" />
        <use href="#cs-pine-far" x="400" y="624" width="14" height="22" />
        <use href="#cs-pine-far" x="465" y="622" width="14" height="22" />
        <use href="#cs-pine-far" x="525" y="626" width="12" height="20" />
        <use href="#cs-pine-far" x="585" y="624" width="12" height="20" />
        <use href="#cs-pine-far" x="985" y="624" width="12" height="20" />
        <use href="#cs-pine-far" x="1045" y="622" width="14" height="22" />
        <use href="#cs-pine-far" x="1100" y="624" width="14" height="22" />
        <use href="#cs-pine-far" x="1160" y="620" width="14" height="22" />
        <use href="#cs-pine-far" x="1215" y="624" width="12" height="20" />
        <use href="#cs-pine-far" x="1270" y="618" width="14" height="22" />
        <use href="#cs-pine-far" x="1325" y="622" width="12" height="20" />
        <use href="#cs-pine-far" x="1380" y="615" width="14" height="22" />
        <use href="#cs-pine-far" x="1430" y="620" width="12" height="20" />
        <use href="#cs-pine-far" x="1480" y="615" width="14" height="22" />
        <use href="#cs-pine-far" x="1525" y="620" width="12" height="20" />
        <use href="#cs-pine-far" x="1565" y="615" width="14" height="22" />
      </g>

      {/* Road climbing to the gate */}
      <path
        d="
          M 660 900
          C 720 800, 770 720, 800 640
          L 800 622
          L 816 622
          L 816 640
          C 836 720, 870 800, 920 900
          Z
        "
        fill="url(#cs-road)"
      />
      <path
        d="M 660 900 C 720 800, 770 720, 800 640 L 800 622"
        stroke="var(--scene-road-edge)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 816 622 L 816 640 C 836 720, 870 800, 920 900"
        stroke="var(--scene-road-edge)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />

      {/* Mid forest band */}
      <g fill="var(--scene-forest-mid)">
        <use href="#cs-pine" x="-10" y="660" width="40" height="80" />
        <use href="#cs-pine" x="40" y="670" width="36" height="72" />
        <use href="#cs-pine" x="90" y="655" width="42" height="84" />
        <use href="#cs-pine" x="145" y="675" width="34" height="68" />
        <use href="#cs-pine" x="195" y="660" width="40" height="80" />
        <use href="#cs-pine" x="250" y="678" width="32" height="64" />
        <use href="#cs-pine" x="300" y="665" width="36" height="72" />
        <use href="#cs-pine" x="355" y="675" width="34" height="68" />
        <use href="#cs-pine" x="410" y="670" width="38" height="76" />
        <use href="#cs-pine" x="470" y="680" width="32" height="64" />
        <use href="#cs-pine" x="520" y="680" width="34" height="68" />
        <use href="#cs-pine" x="570" y="685" width="30" height="60" />
        <use href="#cs-pine" x="970" y="685" width="30" height="60" />
        <use href="#cs-pine" x="1020" y="680" width="34" height="68" />
        <use href="#cs-pine" x="1070" y="680" width="32" height="64" />
        <use href="#cs-pine" x="1125" y="670" width="38" height="76" />
        <use href="#cs-pine" x="1185" y="675" width="34" height="68" />
        <use href="#cs-pine" x="1240" y="665" width="36" height="72" />
        <use href="#cs-pine" x="1295" y="678" width="32" height="64" />
        <use href="#cs-pine" x="1345" y="660" width="40" height="80" />
        <use href="#cs-pine" x="1400" y="675" width="34" height="68" />
        <use href="#cs-pine" x="1450" y="655" width="42" height="84" />
        <use href="#cs-pine" x="1505" y="670" width="36" height="72" />
        <use href="#cs-pine" x="1555" y="660" width="40" height="80" />
      </g>

      {/* Foreground trees framing left and right */}
      <g fill="var(--scene-forest-near)">
        <use href="#cs-pine" x="-30" y="700" width="80" height="160" />
        <use href="#cs-pine" x="60" y="740" width="64" height="128" />
        <use href="#cs-pine" x="135" y="720" width="72" height="144" />
        <use href="#cs-pine" x="210" y="760" width="56" height="112" />
        <use href="#cs-pine" x="270" y="740" width="60" height="120" />
        <use href="#cs-pine" x="335" y="780" width="48" height="96" />
        <use href="#cs-pine" x="385" y="770" width="50" height="100" />
        <use href="#cs-pine" x="440" y="800" width="40" height="80" />
        <use href="#cs-pine" x="475" y="820" width="32" height="64" />

        <use href="#cs-pine" x="1130" y="820" width="32" height="64" />
        <use href="#cs-pine" x="1170" y="800" width="40" height="80" />
        <use href="#cs-pine" x="1220" y="770" width="50" height="100" />
        <use href="#cs-pine" x="1275" y="780" width="48" height="96" />
        <use href="#cs-pine" x="1335" y="740" width="60" height="120" />
        <use href="#cs-pine" x="1395" y="760" width="56" height="112" />
        <use href="#cs-pine" x="1450" y="720" width="72" height="144" />
        <use href="#cs-pine" x="1525" y="740" width="64" height="128" />
        <use href="#cs-pine" x="1600" y="700" width="80" height="160" />
      </g>

      {/* Foreground darkening */}
      <rect x="0" y="780" width="1600" height="120" fill="var(--scene-ground)" opacity="0.6" />
    </svg>
  );
}
