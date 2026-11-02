export function FlexAltarArtwork() {
  return (
    <svg
      viewBox="0 0 900 760"
      role="presentation"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="altar-gold" x1="120" y1="70" x2="740" y2="710" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF4CF" />
          <stop offset=".16" stopColor="#C38C35" />
          <stop offset=".32" stopColor="#FFE9A3" />
          <stop offset=".5" stopColor="#76501B" />
          <stop offset=".68" stopColor="#F4D27B" />
          <stop offset=".84" stopColor="#9A6724" />
          <stop offset="1" stopColor="#FFF0BC" />
        </linearGradient>
        <linearGradient id="altar-gold-dark" x1="170" y1="130" x2="690" y2="640" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6D995" />
          <stop offset=".45" stopColor="#6F4818" />
          <stop offset="1" stopColor="#E9BC61" />
        </linearGradient>
        <linearGradient id="altar-steel" x1="570" y1="300" x2="780" y2="560" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF3D4" />
          <stop offset=".18" stopColor="#9B8A69" />
          <stop offset=".38" stopColor="#27231D" />
          <stop offset=".62" stopColor="#E8D7AE" />
          <stop offset=".82" stopColor="#776344" />
          <stop offset="1" stopColor="#F8E9C3" />
        </linearGradient>
        <radialGradient id="altar-diamond" cx="0" cy="0" r="1" gradientTransform="matrix(0 66 -58 0 450 475)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF" />
          <stop offset=".24" stopColor="#E5E8E8" />
          <stop offset=".52" stopColor="#8E9A9C" />
          <stop offset=".72" stopColor="#F5E8C8" />
          <stop offset="1" stopColor="#6D5E45" />
        </radialGradient>
        <radialGradient id="altar-face" cx="0" cy="0" r="1" gradientTransform="matrix(0 95 -95 0 685 430)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#373027" />
          <stop offset=".72" stopColor="#11100E" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <filter id="altar-metal-shadow" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
          <feOffset dy="16" />
          <feComponentTransfer><feFuncA type="linear" slope=".62" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="altar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse cx="460" cy="565" rx="330" ry="105" fill="#A56D25" opacity=".12" filter="url(#altar-glow)" />

      <g filter="url(#altar-metal-shadow)">
        <path d="M105 205C176 66 330 40 464 72C617 108 785 190 799 304C813 402 685 438 588 485C524 517 482 578 465 668" stroke="#100B06" strokeWidth="42" strokeLinecap="round" />
        <path d="M105 205C176 66 330 40 464 72C617 108 785 190 799 304C813 402 685 438 588 485C524 517 482 578 465 668" stroke="url(#altar-gold)" strokeWidth="28" strokeDasharray="23 10" strokeLinecap="round" />
        <path d="M105 205C176 66 330 40 464 72C617 108 785 190 799 304C813 402 685 438 588 485C524 517 482 578 465 668" stroke="#FFF3CD" strokeWidth="3" strokeDasharray="23 10" strokeDashoffset="3" strokeLinecap="round" opacity=".8" />

        <path d="M165 125C264 24 427 34 552 104C661 166 732 240 718 318C704 388 613 405 529 455" stroke="#090705" strokeWidth="35" strokeLinecap="round" />
        <path d="M165 125C264 24 427 34 552 104C661 166 732 240 718 318C704 388 613 405 529 455" stroke="url(#altar-gold-dark)" strokeWidth="23" strokeDasharray="19 9" strokeLinecap="round" />
        <path d="M165 125C264 24 427 34 552 104C661 166 732 240 718 318C704 388 613 405 529 455" stroke="#FFF0C1" strokeWidth="2.5" strokeDasharray="19 9" strokeDashoffset="2" strokeLinecap="round" opacity=".76" />

        <path d="M104 390C198 474 273 518 348 556C407 586 439 641 446 704" stroke="#0A0704" strokeWidth="29" strokeLinecap="round" />
        <path d="M104 390C198 474 273 518 348 556C407 586 439 641 446 704" stroke="url(#altar-gold)" strokeWidth="19" strokeDasharray="16 8" strokeLinecap="round" />
        <path d="M104 390C198 474 273 518 348 556C407 586 439 641 446 704" stroke="#FFF2C6" strokeWidth="2" strokeDasharray="16 8" strokeDashoffset="2" strokeLinecap="round" opacity=".8" />
      </g>

      <g className="altar-watch" transform="translate(686 430) rotate(18)">
        <path d="M-48 -176L-43 -110M48 -176L43 -110M43 110L48 176M-43 110L-48 176" stroke="#11100D" strokeWidth="84" strokeLinecap="round" />
        <path d="M-48 -176L-43 -110M48 -176L43 -110M43 110L48 176M-43 110L-48 176" stroke="url(#altar-steel)" strokeWidth="68" strokeDasharray="19 10" strokeLinecap="round" />
        <path d="M-48 -176L-43 -110M48 -176L43 -110M43 110L48 176M-43 110L-48 176" stroke="#FFF1D0" strokeWidth="4" strokeDasharray="19 10" strokeDashoffset="3" strokeLinecap="round" opacity=".8" />
        <rect x="-111" y="-118" width="222" height="236" rx="56" fill="#120F0B" stroke="url(#altar-steel)" strokeWidth="16" />
        <rect x="-91" y="-98" width="182" height="196" rx="44" fill="#17140F" stroke="#D6B36D" strokeWidth="3" />
        <circle r="78" fill="url(#altar-face)" stroke="#F1D797" strokeWidth="5" />
        <circle r="67" stroke="#A98543" strokeWidth="1.5" />
        <g stroke="#F4E5C2" strokeWidth="4" strokeLinecap="round">
          <path d="M0 -61V-52M61 0H52M0 61V52M-61 0H-52" />
        </g>
        <g stroke="#E6D5AF" strokeWidth="2" opacity=".8">
          <path d="M0 -69V-64M49 -49L45 -45M69 0H64M49 49L45 45M0 69V64M-49 49L-45 45M-69 0H-64M-49 -49L-45 -45" />
        </g>
        <path d="M0 7L-8 -40M0 7L39 22" stroke="#F8E7C0" strokeWidth="4" strokeLinecap="round" />
        <circle r="7" fill="#C9A45A" stroke="#FFF1CC" strokeWidth="2" />
        <path d="M-111 -5H-132V8H-111M111 -5H132V8H111" fill="#75603F" stroke="#EBD39A" strokeWidth="5" />
        <path d="M-35 -104H35" stroke="#FFF0C5" strokeWidth="3" opacity=".8" />
      </g>

      <g className="altar-ring" transform="translate(216 514) rotate(-22)">
        <ellipse cy="13" rx="90" ry="40" fill="#0B0906" stroke="#5E421C" strokeWidth="28" />
        <ellipse cy="8" rx="90" ry="40" stroke="url(#altar-gold)" strokeWidth="20" />
        <ellipse cy="3" rx="90" ry="40" stroke="#FFF0BD" strokeWidth="2.5" opacity=".9" />
        <path d="M-14 -39L0 -83L14 -39L0 -24Z" fill="url(#altar-diamond)" stroke="#FFF2D6" strokeWidth="3" />
        <path d="M0 -83V-24M-14 -39H14" stroke="#FFF" strokeWidth="1.5" opacity=".8" />
      </g>

      <g className="altar-pendant" transform="translate(457 502)">
        <path d="M-28 -122L-17 -151H17L28 -122" stroke="url(#altar-gold)" strokeWidth="13" strokeLinecap="round" />
        <circle cy="-105" r="18" fill="#15100A" stroke="url(#altar-gold)" strokeWidth="8" />
        <path d="M0 -84L70 -6L0 88L-70 -6Z" fill="#17130D" stroke="url(#altar-gold)" strokeWidth="13" />
        <path d="M0 -68L53 -6L0 67L-53 -6Z" fill="url(#altar-diamond)" stroke="#FFF2CF" strokeWidth="3" />
        <path d="M0 -68V67M-53 -6H53M-53 -6L0 14L53 -6" stroke="#FFF" strokeWidth="1.5" opacity=".76" />
        <path d="M-28 -37L0 -68L28 -37L0 -10Z" fill="#FFF" opacity=".28" />
      </g>

      <g fill="#FFF0C8">
        <path d="M304 227L312 249L334 257L312 265L304 287L296 265L274 257L296 249Z" />
        <path d="M794 514L800 531L817 537L800 543L794 560L788 543L771 537L788 531Z" opacity=".82" />
        <path d="M117 590L122 604L136 609L122 614L117 628L112 614L98 609L112 604Z" opacity=".68" />
      </g>
      <g fill="#D7B66D" opacity=".8">
        <circle cx="350" cy="170" r="4" />
        <circle cx="560" cy="233" r="3" />
        <circle cx="360" cy="636" r="3" />
        <circle cx="774" cy="374" r="4" />
      </g>
    </svg>
  );
}
