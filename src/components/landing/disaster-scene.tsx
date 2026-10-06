"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./disaster-scene.module.css";

const stars = Array.from({ length: 36 }, (_, index) => ({
  x: (index * 193 + 57) % 1600,
  y: (index * 71 + 29) % 280,
  radius: index % 5 === 0 ? 1.4 : 0.7,
}));
const rain = Array.from({ length: 28 }, (_, index) => ({
  x: (index * 139 + 31) % 1600,
  y: (index * 47) % 430,
}));
const windows = [
  [148, 373], [174, 373], [200, 373], [148, 399], [200, 399],
  [266, 331], [292, 331], [266, 357], [292, 383], [344, 393],
  [370, 367], [396, 393], [1227, 367], [1253, 393], [1318, 327],
  [1344, 353], [1370, 327], [1318, 379], [1440, 389], [1466, 363],
];

export function DisasterScene() {
  const id = `resq-scene-${useId().replaceAll(":", "")}`;
  const figure = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = figure.current;
    if (!element) return;
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <figure
      ref={figure}
      className={styles.scene}
      data-running={visible}
      aria-label="ResQ disaster response scene"
    >
      <div className={styles.topline} aria-hidden="true">
        <span><i /> A SIGNAL OF HOPE</span>
        <span>SEARCH & RECONNECT</span>
      </div>

      <svg
        className={styles.art}
        viewBox="0 0 1600 620"
        fill="none"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
      >
        <title id={`${id}-title`}>ResQ. A connected response.</title>
        <desc id={`${id}-description`}>
          An illustrated nighttime disaster response. A rescue helicopter sweeps
          its searchlight over a damaged city, while responders, an emergency
          vehicle, and shelters connect through illuminated routes around ResQ.
        </desc>
        <defs>
          <radialGradient id={`${id}-sky`} cx=".5" cy=".48" r=".65">
            <stop stopColor="#33234f" stopOpacity=".62" />
            <stop offset=".6" stopColor="#171323" stopOpacity=".5" />
            <stop offset="1" stopColor="#09090b" />
          </radialGradient>
          <linearGradient id={`${id}-mountain`} x1="800" y1="180" x2="800" y2="470" gradientUnits="userSpaceOnUse">
            <stop stopColor="#282333" />
            <stop offset="1" stopColor="#111015" />
          </linearGradient>
          <linearGradient id={`${id}-brand`} x1="610" y1="210" x2="990" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#faf6ff" />
            <stop offset=".5" stopColor="#e3d1ff" />
            <stop offset="1" stopColor="#a97de1" />
          </linearGradient>
          <linearGradient id={`${id}-beam`} x1="440" y1="200" x2="480" y2="475" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d2beff" stopOpacity=".28" />
            <stop offset="1" stopColor="#b893ed" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-route`} x1="240" y1="520" x2="1270" y2="530" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a878e4" stopOpacity="0" />
            <stop offset=".5" stopColor="#c3a0f0" stopOpacity=".55" />
            <stop offset="1" stopColor="#a878e4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-water`} x1="300" y1="470" x2="300" y2="590" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8170b0" stopOpacity=".11" />
            <stop offset="1" stopColor="#8170b0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-airframe`} x1=".2" y1="0" x2=".6" y2="1">
            <stop stopColor="#b3a7bd" />
            <stop offset=".38" stopColor="#71657e" />
            <stop offset="1" stopColor="#2b2336" />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#8491ac" />
            <stop offset=".4" stopColor="#454b65" />
            <stop offset="1" stopColor="#1a1a2c" />
          </linearGradient>
          <linearGradient id={`${id}-van`} x1=".3" y1="0" x2=".6" y2="1">
            <stop stopColor="#a89fae" />
            <stop offset=".34" stopColor="#776b83" />
            <stop offset=".7" stopColor="#54475f" />
            <stop offset="1" stopColor="#2e253a" />
          </linearGradient>
          <linearGradient id={`${id}-canvas`} x1=".25" y1="0" x2=".7" y2="1">
            <stop stopColor="#75657f" />
            <stop offset=".4" stopColor="#493a57" />
            <stop offset="1" stopColor="#211728" />
          </linearGradient>
          <linearGradient id={`${id}-canvas-front`} x1="0" y1="0" x2="1" y2=".7">
            <stop stopColor="#675773" />
            <stop offset=".55" stopColor="#3a2c47" />
            <stop offset="1" stopColor="#211a2a" />
          </linearGradient>
          <linearGradient id={`${id}-gear`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#9b7faf" />
            <stop offset=".4" stopColor="#675274" />
            <stop offset="1" stopColor="#362a43" />
          </linearGradient>
          <linearGradient id={`${id}-doorlight`} x1=".5" y1="0" x2=".5" y2="1">
            <stop stopColor="#ddc29d" stopOpacity=".26" />
            <stop offset="1" stopColor="#a286bc" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-groundlight`}>
            <stop stopColor="#a286bf" stopOpacity=".17" />
            <stop offset="1" stopColor="#a286bf" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-headlight`} x1="0" y1=".5" x2="1" y2=".5">
            <stop stopColor="#e8d6b5" stopOpacity=".24" />
            <stop offset="1" stopColor="#e8d6b5" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#aa77e4" stopOpacity=".22" />
            <stop offset="1" stopColor="#aa77e4" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <g id={`${id}-responder`}>
            <ellipse cx="1" cy="51" rx="12" ry="2.6" fill="#050408" fillOpacity=".7" />
            <path d="M-4 30L-5 45Q-5 48-2 48L0 35L3 46Q4 49 7 47L5 29Z" fill="#292331" stroke="#635469" strokeWidth=".5" />
            <path d="M-5 45L-7 49Q-7 51-2 50L0 48L-1 45ZM3 46L3 50L11 51Q13 50 9 47L7 46Z" fill="#16121b" stroke="#746278" strokeWidth=".45" />
            <path d="M-3 10V14H3V10" fill="#9b7e75" />
            <path d="M-5 13Q0 10 5 13L8 27L5 32H-5L-8 28Z" fill={`url(#${id}-gear)`} stroke="#a18bb0" strokeWidth=".5" />
            <path d="M-4 14L-3 27M4 14L3 27M-6 22H6" stroke="#c5b6d2" strokeWidth="1.4" strokeOpacity=".65" />
            <path d="M0 14V30M-5 28H5" stroke="#231d2b" strokeWidth="1" />
            <path d="M-6 14Q-9 14-10 19L-12 28Q-11 31-8 29L-5 19M5 14Q8 12 11 11L13 6L16 7L14 15Q10 20 7 20" fill={`url(#${id}-gear)`} stroke="#8e789e" strokeWidth=".5" />
            <path d="M-12 28Q-13 30-11 33Q-8 32-8 29ZM13 6Q12 3 15 3Q18 4 16 7Z" fill="#a38a7b" />
            <rect x="13" y="-1" width="3" height="7" rx=".8" fill="#28232f" stroke="#a195aa" strokeWidth=".5" />
            <path d="M15-1V-4" stroke="#a195aa" strokeWidth=".6" />
            <path d="M-4 3Q-3-2 2-1Q6 0 5 7L3 10Q-2 11-4 7Z" fill="#ad8e79" />
            <path d="M3 1Q7 3 5 7L3 10H1L2 3Z" fill="#756073" />
            <path d="M-5 3Q-4-3 1-3Q6-3 7 2L7 4H-5Z" fill="#a998ad" stroke="#d3c3dc" strokeWidth=".6" />
            <path d="M-5 4H7" stroke="#4d4156" strokeWidth="1" />
            <path d="M-3 1H4" stroke="#e3d3eb" strokeWidth=".6" strokeOpacity=".7" />
            <rect x="3.5" y="24" width="3" height="5" rx=".7" fill="#33283e" />
          </g>
          <clipPath id={`${id}-wordmark`}>
            <text x="800" y="348" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="186" letterSpacing="-12">ResQ</text>
          </clipPath>
          <linearGradient id={`${id}-shine`}>
            <stop stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".45" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="1600" height="620" fill={`url(#${id}-sky)`} />
        <ellipse className={styles.halo} cx="800" cy="320" rx="450" ry="280" fill={`url(#${id}-halo)`} />
        <g fill="#c8b9e6" opacity=".4">
          {stars.map((star, index) => <circle key={index} cx={star.x} cy={star.y} r={star.radius} />)}
        </g>

        {/* Layered storm clouds and a distant, broken skyline. */}
        <g className={styles.clouds} fill="#32263e" opacity=".2">
          <path d="M0 162Q75 105 149 144Q205 83 276 138Q323 109 368 158Q415 129 481 168H0Z" />
          <path d="M1130 132Q1185 88 1241 116Q1308 62 1376 117Q1444 79 1510 127Q1560 105 1620 146H1130Z" />
          <path d="M540 76Q610 31 683 74Q736 38 793 72Q846 51 897 88H540Z" opacity=".45" />
        </g>
        <path d="M0 345L111 281L170 310L256 231L308 267L364 230L463 323L531 272L597 335L690 293L766 349L843 284L894 320L950 259L1048 331L1135 272L1192 309L1264 233L1312 270L1390 240L1502 320L1600 274V500H0Z" fill={`url(#${id}-mountain)`} opacity=".5" />
        <path d="M0 419H82V373H108V419H124V351H219L237 370V426H253V301H311V421H327V347H357L373 366L398 342L425 364V426H457V388H488V446H1139V398H1174V433H1210V345H1273V437H1301V301H1390V423H1424V345H1496V431H1535V370H1600V481H0Z" fill="#16131b" stroke="#393041" strokeWidth="1" />
        <path d="M222 352L205 376L218 386L199 413M370 348L351 369L367 382L354 420M1331 302L1322 329L1339 339L1327 355" stroke="#09090b" strokeWidth="3" />
        <g fill="#29212f" fillOpacity=".5" stroke="#66546e" strokeOpacity=".2" strokeWidth=".7">
          <path d="M253 301L263 291H321L311 301ZM311 301L321 291V419L311 426Z" />
          <path d="M1301 301L1314 290H1403L1390 301ZM1390 301L1403 290V427L1390 434Z" />
          <path d="M1210 345L1220 336H1283L1273 345ZM1273 345L1283 336V433L1273 437Z" />
          <path d="M1424 345L1434 338H1506L1496 345ZM1496 345L1506 338V430L1496 438Z" />
        </g>
        <g stroke="#6d5a7a" strokeOpacity=".2" strokeWidth=".7">
          <path d="M272 300V283H283V300M1337 301V279M1330 284H1344M1309 342H1381M1309 368H1381M259 369H306M1431 401H1489" />
        </g>
        <g fill="#b2a0c4" opacity=".12">
          {windows.map(([x, y], index) => <rect key={index} x={x} y={y} width="8" height="12" rx="1" />)}
        </g>
        <g className={styles.windowLights} fill="#d5b080">
          <rect x="266" y="383" width="8" height="12" rx="1" />
          <rect x="1370" y="379" width="8" height="12" rx="1" />
          <rect x="370" y="393" width="8" height="12" rx="1" />
        </g>

        <g className={styles.rain} stroke="#ada0c6" strokeOpacity=".11" strokeWidth="1">
          {rain.map((drop, index) => <path key={index} d={`M${drop.x} ${drop.y}l-7 22`} style={{ animationDelay: `${index * -.19}s` }} />)}
        </g>

        {/* Search aircraft and its slowly sweeping light. */}
        <g className={styles.helicopter}>
          <path className={styles.searchBeam} d="M438 190L333 463Q465 491 561 449L450 190Z" fill={`url(#${id}-beam)`} />
          <g strokeLinecap="round" strokeLinejoin="round">
            <ellipse className={styles.rotorWash} cx="441" cy="137" rx="84" ry="3" fill="#c5b5db" fillOpacity=".1" />
            <path d="M345 155L339 133L332 131L333 164L409 179L418 167Z" fill={`url(#${id}-airframe)`} stroke="#9c8dac" strokeWidth=".8" />
            <path d="M339 154L410 167" stroke="#d0bddf" strokeWidth=".6" strokeOpacity=".55" />
            <path d="M409 163C419 146 446 145 462 151C473 156 487 165 490 176C493 186 481 193 463 194L430 191C416 189 405 178 409 163Z" fill={`url(#${id}-airframe)`} stroke="#b3a1c8" strokeWidth=".9" />
            <path d="M410 175Q447 185 490 178Q485 194 463 194L430 191Q416 189 410 175Z" fill="#211b2d" fillOpacity=".7" />
            <path d="M444 151Q461 149 475 162Q485 171 483 177L448 176Z" fill={`url(#${id}-glass)`} stroke="#c6b7d3" strokeWidth=".8" />
            <path d="M450 154Q465 155 478 168" stroke="#b9c3d8" strokeOpacity=".5" strokeWidth=".8" />
            <path d="M465 156L467 176" stroke="#1b1927" strokeWidth="1.4" />
            <path d="M422 158H438V174H417Q416 165 422 158Z" fill={`url(#${id}-glass)`} stroke="#ac9cbc" strokeWidth=".7" />
            <path d="M421 155Q438 147 452 150" stroke="#e1cde9" strokeWidth=".7" strokeOpacity=".55" />
            <path d="M441 150V140M437 140H446" stroke="#bbadc9" strokeWidth="2.2" />
            <path d="M357 136Q438 134 524 137M416 137L458 138" stroke="#b6a4cb" strokeWidth="1.2" />
            <path d="M425 190L420 200M472 192L478 201M410 201Q450 205 488 201" stroke="#b8a9c5" strokeWidth="1.7" />
            <path d="M419 179V187M440 179V188M420 185H438" stroke="#ac9dbc" strokeWidth=".6" strokeOpacity=".4" />
            <circle cx="344" cy="155" r="8" stroke="#9a89ac" strokeWidth=".8" />
            <path d="M338 150L350 160M338 160L350 150" stroke="#c2afd1" strokeWidth=".8" />
            <path d="M454 182V189M450.5 185.5H457.5" stroke="#d4bedf" strokeWidth="1.2" />
            <circle className={styles.beacon} cx="479" cy="184" r="1.8" fill="#d4b7ff" />
            <circle cx="438" cy="194" r="2" fill="#e1d3ee" />
          </g>
        </g>

        {/* The central identity stays clear at every screen size. */}
        <g className={styles.brand}>
          <path d="M633 182H711M889 182H967" stroke="#a482d0" strokeOpacity=".24" />
          <text x="800" y="185" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="10" letterSpacing="3.5" fill="#a493ba">CONNECTED RESPONSE</text>
          <text x="800" y="348" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="186" letterSpacing="-12" fill={`url(#${id}-brand)`}>ResQ</text>
          <text className={styles.wordmarkTrace} x="800" y="348" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="186" letterSpacing="-12" stroke="#e9d8ff" strokeWidth=".6" fill="none">ResQ</text>
          <g clipPath={`url(#${id}-wordmark)`}>
            <rect className={styles.wordmarkShine} x="510" y="195" width="95" height="170" fill={`url(#${id}-shine)`} transform="skewX(-15)" />
          </g>
          <text x="800" y="391" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" letterSpacing="5" fill="#9783ad">SEARCH. RESPOND. RECONNECT.</text>
        </g>

        {/* Terrain, floodwater, and perspective routes to the response hub. */}
        <path d="M0 468Q118 440 255 463T500 467L611 447L752 462L883 451L990 463Q1180 441 1302 465T1600 454V620H0Z" fill="#0c0b10" />
        <path d="M0 481Q96 461 205 482Q267 491 356 480Q401 475 469 490L586 620H0Z" fill={`url(#${id}-water)`} />
        <g className={styles.water} stroke="#9381b0" strokeOpacity=".13">
          <path d="M33 505Q97 497 181 505T351 505M0 530Q96 521 227 532T435 532M55 562Q180 551 343 566M279 493H330M106 542H163" />
        </g>
        <path d="M758 476L578 620H1022L844 476" fill="#211929" fillOpacity=".25" />
        <ellipse cx="801" cy="507" rx="274" ry="77" fill={`url(#${id}-groundlight)`} />
        <path d="M774 477L669 620M827 477L930 620" stroke="#73548a" strokeOpacity=".14" />
        <path d="M797 482V505M800 528V561M801 590V620" stroke="#ac86cd" strokeOpacity=".2" />
        <g stroke={`url(#${id}-route)`} strokeWidth="1.1">
          <path d="M257 519H400Q421 519 441 511L512 492Q528 488 551 488H715L778 464M1347 523H1215Q1193 523 1173 516L1086 497Q1065 491 1043 491H885L823 464" />
          <path d="M493 575H624L701 517H899L976 575H1107" opacity=".45" />
        </g>
        <g className={styles.routeSignal} stroke="#c1a0e8" strokeWidth="1.5" strokeDasharray="3 180" opacity=".65">
          <path d="M257 519H400Q421 519 441 511L512 492Q528 488 551 488H715L778 464" />
          <path d="M1347 523H1215Q1193 523 1173 516L1086 497Q1065 491 1043 491H885L823 464" />
        </g>
        <g stroke="#6d5084" fill="#120c1b">
          <circle cx="421" cy="519" r="4" /><circle cx="1193" cy="523" r="4" />
          <circle cx="533" cy="488" r="3" /><circle cx="1065" cy="491" r="3" />
        </g>

        {/* Field command point, communications mast, and rescue crew. */}
        <ellipse cx="798" cy="521" rx="116" ry="9" fill="#050408" fillOpacity=".65" />
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M706 514L710 477Q714 441 746 437L842 437Q868 443 878 475L884 514Z" fill={`url(#${id}-canvas)`} stroke="#897097" strokeWidth=".8" />
          <path d="M745 438Q774 439 782 477L785 514H883L876 479Q861 453 839 444Z" fill="#1f1829" fillOpacity=".35" />
          <path d="M706 514L710 477Q714 444 744 439Q775 440 782 477L785 514Z" fill={`url(#${id}-canvas-front)`} stroke="#a088b1" strokeWidth="1" />
          <path d="M713 511L717 479Q721 450 744 447Q766 448 775 479L778 511" stroke="#c4a9d2" strokeWidth="2.6" strokeOpacity=".28" />
          <path d="M786 440Q813 447 821 480L825 513M837 441Q863 451 872 481L877 513" stroke="#b29bbd" strokeWidth="2.8" strokeOpacity=".28" />
          <path d="M714 478H879M780 491H881M767 453L861 453" stroke="#b3a0bf" strokeWidth=".6" strokeOpacity=".22" />
          <path d="M732 514V483Q732 472 744 472Q757 472 757 483V514Z" fill="#17121f" stroke="#ae98b9" strokeWidth=".8" />
          <path d="M733 482Q744 473 756 482V514H733Z" fill={`url(#${id}-doorlight)`} />
          <path d="M731 477L725 513M758 477L764 513" stroke="#826491" strokeWidth="1" />
          <path d="M724 461L692 524M867 461L902 521" stroke="#b39abe" strokeWidth=".6" strokeOpacity=".5" />
          <path d="M688 524H696M898 521H906" stroke="#937d9c" strokeWidth="1.2" />
          <rect x="802" y="472" width="26" height="18" rx="3" fill="#2c2336" stroke="#8c7598" strokeWidth=".6" />
          <path d="M815 476V486M810 481H820" stroke="#ba9ccc" strokeWidth="1.3" />
          <path d="M858 439V414M851 416L858 407L865 416" stroke="#7c638e" strokeWidth="1.2" />
          <path d="M874 444V381M866 387H882" stroke="#7c638e" strokeWidth="1.2" />
          <circle cx="874" cy="378" r="2.5" fill="#b68cd8" stroke="none" />
          <path className={styles.radioWave} d="M862 371Q874 359 886 371M855 364Q874 344 893 364" stroke="#b58cda" strokeOpacity=".6" />
        </g>
        <rect x="735" y="464" width="18" height="2" rx="1" fill="#d1bbdf" opacity=".65" />
        <g className={styles.hubGlow} filter={`url(#${id}-glow)`}>
          <circle cx="744" cy="473" r="1.5" fill="#ead6bd" />
          <path d="M727 519H764" stroke="#c0a0d4" strokeOpacity=".4" />
        </g>
        <use href={`#${id}-responder`} transform="translate(678 471)" />
        <use href={`#${id}-responder`} transform="translate(926 474) scale(-1 1)" />

        {/* Emergency vehicle, refuge tents, and quiet amber hazard lamps. */}
        <g className={styles.vehicle} transform="translate(1030 460)" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="65" cy="57" rx="80" ry="7" fill="#050408" fillOpacity=".7" />
          <path d="M119 31L178 28L182 54L119 39Z" fill={`url(#${id}-headlight)`} />
          <path d="M4 43V10Q4 3 12 3H80Q91 3 96 12L107 25L116 29Q123 32 123 41V49H111Q111 36 98 36Q85 36 85 49H40Q40 36 27 36Q14 36 14 49H7Q4 48 4 43Z" fill={`url(#${id}-van)`} stroke="#b2a0bf" strokeWidth=".9" />
          <path d="M6 30H90L106 34H120V40H109Q101 34 92 40H37Q27 34 17 40H6Z" fill="#8b5bab" fillOpacity=".6" />
          <path d="M6 42H16M39 43H85M110 43H122" stroke="#231d2d" strokeWidth="3" />
          <path d="M6 10Q6 5 13 5H79Q89 5 92 11" stroke="#d5c4de" strokeWidth=".7" strokeOpacity=".6" />
          <path d="M74 8H81Q86 8 89 13L99 25H75Z" fill={`url(#${id}-glass)`} stroke="#c4b5d0" strokeWidth=".6" />
          <path d="M79 10Q85 10 88 15L94 22" stroke="#a5b1c8" strokeWidth=".7" strokeOpacity=".7" />
          <path d="M69 6V39M104 28V38M11 22H62" stroke="#3a2d47" strokeWidth=".8" />
          <path d="M73 30H78M98 27L104 23H109V29H104" stroke="#c1aace" strokeWidth="1" />
          <rect x="13" y="9" width="45" height="13" rx="2.5" fill="#302637" stroke="#c6b3d0" strokeWidth=".5" />
          <path d="M35 11V20M30.5 15.5H39.5" stroke="#ddc9e8" strokeWidth="1.6" />
          <text x="18" y="29" fontFamily="Arial, Helvetica, sans-serif" fontSize="5.2" fontWeight="600" letterSpacing=".8" fill="#e5d5ed">RESCUE</text>
          <g fill="#111016" stroke="#71617d" strokeWidth="1">
            <circle cx="27" cy="48" r="9.5" /><circle cx="98" cy="48" r="9.5" />
          </g>
          <g fill="#706475" stroke="#b7a4c0" strokeWidth=".5">
            <circle cx="27" cy="48" r="4.8" /><circle cx="98" cy="48" r="4.8" />
          </g>
          <g stroke="#342937" strokeWidth=".7">
            <path d="M27 44V52M23 48H31M98 44V52M94 48H102" />
          </g>
          <rect x="55" y="0" width="22" height="3" rx="1" fill="#252130" />
          <rect className={styles.beacon} x="57" y="-2" width="18" height="3" rx="1.5" fill="#bea0f0" />
          <path d="M119 32V36" stroke="#e8d7b7" strokeWidth="2.6" />
          <path d="M4 30V35" stroke="#ba8b8e" strokeWidth="1.8" />
        </g>
        <g strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="1267" cy="519" rx="49" ry="5" fill="#050408" fillOpacity=".7" />
          <path d="M1234 513L1239 481Q1252 461 1267 449Q1285 461 1299 481L1303 514Z" fill={`url(#${id}-canvas)`} stroke="#8d789a" strokeWidth=".8" />
          <path d="M1267 450Q1263 480 1267 513H1303L1299 481Q1285 461 1267 450Z" fill="#19141f" fillOpacity=".4" />
          <path d="M1255 514V487Q1267 472 1279 487V514Z" fill="#19131f" stroke="#8f769d" strokeWidth=".7" />
          <path d="M1267 451L1267 478M1239 481Q1266 489 1299 481M1239 481L1218 520M1299 481L1315 520" stroke="#b29abd" strokeWidth=".5" strokeOpacity=".4" />
          <path d="M1310 514L1314 488Q1323 471 1335 461Q1350 472 1359 488L1363 514Z" fill={`url(#${id}-canvas-front)`} stroke="#715e7c" strokeWidth=".7" />
          <path d="M1327 514V490Q1335 481 1345 490V514Z" fill="#19131f" />
          <path d="M1335 462V481M1314 488L1304 518M1359 488L1374 517" stroke="#a189af" strokeOpacity=".3" strokeWidth=".6" />
        </g>
        <g stroke="#64515f" strokeWidth=".5" strokeLinejoin="round">
          <path d="M340 467L348 456L365 451L378 454L391 467L375 472L353 470Z" fill="#312630" />
          <path d="M348 456L365 451L378 454L369 463L340 467Z" fill="#54404b" />
          <path d="M302 467L306 459L316 454L329 461L336 470L317 471Z" fill="#3a2c36" />
          <path d="M401 472L410 464L426 460L439 467L453 477L429 475Z" fill="#30242e" />
          <path d="M236 470L243 459L254 461L265 475L248 474Z" fill="#49353f" />
          <path d="M350 468L369 463L391 467M410 464L426 460L433 469" stroke="#877080" strokeOpacity=".3" />
        </g>
        <g className={styles.hazardLights} fill="#c3a377">
          <circle cx="636" cy="529" r="1.7" /><circle cx="966" cy="529" r="1.7" />
          <circle cx="588" cy="566" r="1.5" /><circle cx="1014" cy="566" r="1.5" />
        </g>
        <path d="M0 590Q333 554 567 601T1042 596T1600 580V620H0Z" fill="#09090b" opacity=".76" />
      </svg>

      <figcaption className={styles.bottomline}>
        <span>Every connection brings us closer.</span>
      </figcaption>
    </figure>
  );
}
