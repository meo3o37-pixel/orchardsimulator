import ANIMATION_LAB_DAY_NIGHT_SLIDER_HTML from './animationLabDayNightSlider.html?raw';
import ANIMATION_LAB_QUEUE_TICKET_PRINTER_HTML from './animationLabQueueTicketPrinter.html?raw';
import ANIMATION_LAB_APP_LONG_PRESS_HTML from './animationLabAppLongPress.html?raw';
import ANIMATION_LAB_APPLE_SORTER_HTML from './animationLabAppleSorter.html?raw';
import ANIMATION_LAB_APPLE_STEM_REMOVAL_HTML from './animationLabAppleStemRemoval.html?raw';
import ANIMATION_LAB_MOVING_SILHOUETTE_HTML from './animationLabMovingSilhouette.html?raw';
import ANIMATION_LAB_INDUSTRIAL_CONTROL_PANEL_HTML from './animationLabIndustrialControlPanel.html?raw';
import ANIMATION_LAB_CARD_PAYMENT_HTML_RAW from './animationLabCardPayment.html?raw';
import ANIMATION_LAB_CARD_PAYMENT_NEW_HTML_RAW from './animationLabCardPaymentNew.html?raw';
import ANIMATION_LAB_CASH_PAYMENT_HTML from './animationLabCashPayment.html?raw';
import { ANIMATION_LAB_CURRENT_FIELD_MAP_300_HTML } from '../features/fieldMap300/buildCurrentFieldMap300Preset';

export const ANIMATION_LAB_DEFAULT_PRESET_KEY = 'vehicleFuel';

const withDayNightSliderPreset = (html, title, sliderValue) => html
  .replace('<title>Day Night Slider Preview</title>', `<title>${title}</title>`)
  .replace('<input id="timeSlider" type="range" min="0" max="200" value="0" />', `<input id="timeSlider" type="range" min="0" max="200" value="${sliderValue}" />`);

const escapeHtmlForSrcDocAttr = (html = '') => String(html || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

const buildTransportCrateSrcDoc = (html = '') => String(html || '').replace(
  '</head>',
  `<style>
  html, body {
    width: 620px !important;
    height: 520px !important;
    min-height: 0 !important;
    overflow: hidden !important;
    background: transparent !important;
  }
  body {
    display: block !important;
  }
  .scene {
    margin: 0 auto;
  }
  </style></head>`,
);

export const ANIMATION_LAB_APPLE_PARTIAL_SORT_HTML = String(ANIMATION_LAB_APPLE_STEM_REMOVAL_HTML || '')
  .replace('<title>CSS 적과가위 사과 꼭지 제거</title>', '<title>CSS 사과 부분선별</title>')
  .replace(
    '</style>',
    `
    .shears-wrap,
    .stem-fall,
    .particles {
      display: none !important;
    }

    .apple-job.is-working .stem,
    .apple-job.is-working .leaf,
    .apple-job.is-working .stem-fall {
      animation: none !important;
    }

    .apple-job.is-done .stem,
    .apple-job.is-done .leaf,
    .apple-job.is-done .apple {
      display: block !important;
    }
    </style>`
  );

export const ANIMATION_LAB_DEFAULT_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>연료탱크 채움 애니메이션</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    background: #1b1f24;
    font-family: Arial, sans-serif;
  }
  .tank-wrap {
    position: relative;
    width: 420px;
    height: 260px;
  }
  .shadow {
    position: absolute;
    left: 60px;
    bottom: 18px;
    width: 310px;
    height: 24px;
    background: rgba(0, 0, 0, 0.28);
    filter: blur(10px);
    border-radius: 50%;
  }
  .tank-shell {
    position: absolute;
    left: 30px;
    top: 50px;
    width: 360px;
    height: 150px;
    border-radius: 26px;
    overflow: hidden;
    background:
      linear-gradient(
        to bottom,
        #dfe3e7 0%,
        #b7bec5 16%,
        #f2f5f7 34%,
        #a5adb5 52%,
        #edf1f4 70%,
        #939ba3 100%
      );
    box-shadow:
      inset 0 2px 0 rgba(255,255,255,0.8),
      inset 0 -8px 14px rgba(0,0,0,0.14),
      0 16px 28px rgba(0,0,0,0.28);
  }
  .fuel {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0%;
    background:
      linear-gradient(
        to top,
        rgba(205, 110, 15, 0.95) 0%,
        rgba(233, 145, 24, 0.95) 45%,
        rgba(255, 190, 58, 0.95) 100%
      );
    animation: fillTank 4s ease-in-out forwards;
    z-index: 1;
  }
  .fuel::before {
    content: "";
    position: absolute;
    top: -8px;
    left: -3%;
    width: 106%;
    height: 16px;
    background: rgba(255, 232, 170, 0.55);
    border-radius: 50%;
    filter: blur(1px);
    animation: wave 1.4s ease-in-out infinite;
  }
  .fuel::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,0.03) 0px,
        rgba(255,255,255,0.03) 2px,
        rgba(0,0,0,0.03) 3px,
        rgba(0,0,0,0.03) 4px
      );
    opacity: 0.35;
  }
  .shine {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to right,
        transparent 0%,
        rgba(255,255,255,0.12) 18%,
        rgba(255,255,255,0.38) 50%,
        rgba(255,255,255,0.1) 82%,
        transparent 100%
      );
    z-index: 3;
    pointer-events: none;
  }
  .metal-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to bottom,
        rgba(255,255,255,0.10) 0%,
        rgba(255,255,255,0.02) 25%,
        rgba(0,0,0,0.06) 55%,
        rgba(255,255,255,0.04) 100%
      );
    z-index: 2;
    pointer-events: none;
  }
  .percent {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 34px;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    text-shadow: 0 2px 10px rgba(0,0,0,0.45);
    z-index: 6;
    letter-spacing: 1px;
  }
  .cap-neck {
    position: absolute;
    left: 196px;
    top: 28px;
    width: 24px;
    height: 26px;
    background: linear-gradient(to bottom, #9da4aa, #697077);
    border-radius: 6px 6px 4px 4px;
    z-index: 8;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
  }
  .cap {
    position: absolute;
    left: 186px;
    top: 13px;
    width: 44px;
    height: 22px;
    background: linear-gradient(to bottom, #4e545a, #2d3136);
    border-radius: 999px;
    z-index: 9;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.25),
      0 2px 6px rgba(0,0,0,0.25);
  }
  .strap {
    position: absolute;
    top: 38px;
    width: 14px;
    height: 176px;
    background: linear-gradient(to right, #24282d 0%, #5f666e 45%, #20252a 100%);
    border-radius: 8px;
    z-index: 10;
    box-shadow:
      inset 1px 0 0 rgba(255,255,255,0.08),
      0 2px 6px rgba(0,0,0,0.22);
  }
  .strap.s1 { left: 105px; }
  .strap.s2 { left: 300px; }
  .strap::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -10px;
    transform: translateX(-50%);
    width: 26px;
    height: 14px;
    background: #6b7279;
    border-radius: 0 0 8px 8px;
  }
  @keyframes fillTank {
    from {
      height: 0%;
    }
    to {
      height: 68%;
    }
  }
  @keyframes wave {
    0% {
      transform: translateX(0px);
    }
    50% {
      transform: translateX(8px);
    }
    100% {
      transform: translateX(0px);
    }
  }
</style>
</head>
<body>
  <div class="tank-wrap">
    <div class="cap"></div>
    <div class="cap-neck"></div>
    <div class="tank-shell">
      <div class="fuel"></div>
      <div class="metal-overlay"></div>
      <div class="shine"></div>
      <div class="percent">68%</div>
    </div>
    <div class="strap s1"></div>
    <div class="strap s2"></div>
    <div class="shadow" style="transform: translate(0px, 0px);"></div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_CAN_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
body {
  margin: 0;
  height: 100vh;
  display: grid;
  place-items: center;
  background: #1b1f24;
}
.can-wrap {
  position: relative;
  width: 260px;
  height: 360px;
}
.can {
  position: absolute;
  inset: 0;
  border-radius: 26px;
  background: linear-gradient(to bottom, #f5f5f5, #dddddd);
  box-shadow:
    inset 0 10px 18px rgba(255,255,255,0.7),
    inset 0 -10px 20px rgba(0,0,0,0.08),
    0 16px 28px rgba(0,0,0,0.25);
  overflow: hidden;
}
.handle-hole {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 16px;
  background: #1b1f24;
  border-radius: 10px;
  z-index: 3;
}
.cap {
  position: absolute;
  top: 20px;
  left: 24px;
  width: 36px;
  height: 22px;
  background: linear-gradient(to bottom, #ff4a3a, #c81410);
  border-radius: 6px;
  z-index: 5;
}
.neck {
  position: absolute;
  top: 32px;
  left: 28px;
  width: 28px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 8px;
  z-index: 2;
}
.panel {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 56px;
  bottom: 18px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0,0,0,0.05);
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,0.45),
    inset 0 10px 20px rgba(255,255,255,0.2);
}
.fuel {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0%;
  background: linear-gradient(
    to top,
    #b84e10 0%,
    #d97706 35%,
    #f59e0b 70%,
    #ffd36a 100%
  );
  animation: fill 4s ease-in-out forwards;
}
.fuel::before {
  content: "";
  position: absolute;
  top: -7px;
  left: -5%;
  width: 110%;
  height: 14px;
  background: rgba(255,220,120,0.7);
  border-radius: 50%;
  animation: wave 1.2s infinite ease-in-out;
  box-shadow: 0 0 10px rgba(255,190,80,0.25);
}
.percent {
  position: absolute;
  bottom: 36px;
  width: 100%;
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #333;
  z-index: 6;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}
.bottom-cut::before,
.bottom-cut::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 40px;
  height: 18px;
  background: #1b1f24;
  border-radius: 10px 10px 0 0;
}
.bottom-cut::before { left: 50px; }
.bottom-cut::after { right: 50px; }
.shadow {
  position: absolute;
  bottom: -12px;
  left: 30px;
  right: 30px;
  height: 20px;
  background: rgba(0,0,0,0.3);
  filter: blur(10px);
  border-radius: 50%;
}
@keyframes fill {
  from { height: 0%; }
  to   { height: 74%; }
}
@keyframes wave {
  0% { transform: translateX(0); }
  50% { transform: translateX(7px); }
  100% { transform: translateX(0); }
}
</style>
</head>
<body>
<div class="can-wrap">
  <div class="can">
    <div class="neck"></div>
    <div class="handle-hole"></div>
    <div class="cap"></div>
    <div class="panel">
      <div class="fuel"></div>
    </div>
    <div class="percent">62%</div>
    <div class="bottom-cut"></div>
  </div>
  <div class="shadow"></div>
</div>
</body>
</html>`;

export const ANIMATION_LAB_PALLET_JACK_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pallet Jack Animation</title>
<style>
  * {
    box-sizing: border-box;
  }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #1f2937;
  font-family: system-ui, sans-serif;
}

.scene {
  position: relative;
  width: min(529.59px, 95vw);
  height: 368px;
  overflow: hidden;
  border-radius: 16px;
  background:
    linear-gradient(#dbeafe 0 58%, #c7d2fe 58% 59%, #9ca3af 59% 100%);
}

.transport-label {
  position: absolute;
  left: 50%;
  top: 34px;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.transport-gauge {
  position: absolute;
  left: 50%;
  top: 72px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  width: min(320px, calc(100% - 120px));
  z-index: 10;
  pointer-events: none;
}

.transport-gauge__label {
  padding: 4px 12px 5px;
  margin-bottom: 12px;
  border-radius: 999px;
  border: 1px solid rgba(214, 220, 224, 0.34);
  background: linear-gradient(180deg, rgba(88, 95, 102, 0.92), rgba(58, 64, 70, 0.94));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.15),
    0 4px 10px rgba(38, 43, 48, .16);
  font: 900 13px/1 "Arial", sans-serif;
  letter-spacing: -0.02em;
  color: #eefcf5;
  text-shadow: 0 1px 0 rgba(0,0,0,.18);
}

.transport-gauge__track {
  position: relative;
  width: 100%;
  height: 13px;
  overflow: hidden;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(242, 244, 245, 0.96), rgba(202, 207, 211, 0.96));
  border: 1px solid rgba(88, 97, 104, 0.34);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,.76),
    inset 0 -1px 2px rgba(73, 80, 86, .14),
    0 5px 12px rgba(58, 64, 70, .14);
}

.transport-gauge__fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  border-radius: inherit;
  background:
    repeating-linear-gradient(
      -60deg,
      #a9b1b6 0 14px,
      #848e95 14px 26px
    ),
    linear-gradient(90deg, #b9c1c6 0%, #8f999f 48%, #6e787f 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.28),
    0 0 10px rgba(96,104,112,.16);
  animation: transportGaugeFill 1200ms linear infinite;
}

.transport-gauge__fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,0) 56%),
    linear-gradient(90deg, transparent 0%, rgba(92,102,110,.46) 88%, rgba(238,242,244,.84) 100%);
}

.floor-line {
  position: absolute;
  left: 0;
  bottom: 54px;
  width: 200%;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    rgba(255,255,255,.75) 0 36px,
    transparent 36px 68px
  );
  animation: floorMove 0.5s linear infinite;
}

.pallet-jack {
  position: absolute;
  left: 50%;
  bottom: 44px;
  width: 230px;
  height: 145px;
  transform: translateX(-50%);
  transform-origin: center bottom;
  animation:
    bounce 0.55s ease-in-out infinite;
}

.shadow {
  position: absolute;
  left: 20px;
  bottom: 6px;
  width: 170px;
  height: 18px;
  background: rgba(0,0,0,.22);
  border-radius: 50%;
  filter: blur(3px);
  z-index: 0;
  animation: shadowPulse 0.55s ease-in-out infinite;
}

.fork {
  position: absolute;
  left: 28px;
  bottom: 36px;
  width: 150px;
  height: 10px;
  background: linear-gradient(
    180deg,
    #fbbf24 0%,
    #f59e0b 55%,
    #b45309 100%
  );
  border: 2px solid #92400e;
  border-radius: 999px;
  transform-origin: left center;
  z-index: 2;
}

.fork.top {
  position: absolute;
  bottom: 48px;
}

.wheel {
  position: absolute;
  bottom: 18px;
  width: 30px;
  height: 30px;
  background: #111827;
  border: 5px solid #4b5563;
  border-radius: 50%;
  z-index: 3;
  animation: wheelSpin 0.42s linear infinite;
}

.wheel::before {
  content: "";
  position: absolute;
  inset: 7px;
  background: #9ca3af;
  border-radius: 50%;
}

.wheel::after {
  content: "";
  position: absolute;
  left: 50%;
  top: -4px;
  width: 4px;
  height: 28px;
  background: #d1d5db;
  transform: translateX(-50%);
  border-radius: 999px;
}

.wheel.back {
  left: 30px;
}

.wheel.front {
  left: 154px;
  width: 22px;
  height: 22px;
  bottom: 22px;
}

.wheel.front::after {
  top: -1px;
  width: 3px;
  height: 18px;
}

.handle {
  position: absolute;
  left: 16px;
  bottom: 58px;
  width: 8px;
  height: 86px;
  background: linear-gradient(
    90deg,
    #111827 0%,
    #4b5563 35%,
    #d1d5db 50%,
    #374151 65%,
    #111827 100%
  );
  border: 2px solid #111827;
  border-radius: 999px;
  transform: rotate(-30deg);
  transform-origin: bottom center;
  z-index: 4;
  box-shadow:
    inset 1px 0 0 rgba(255,255,255,.18),
    2px 3px 0 rgba(0,0,0,.14);
}

.handle::before {
  content: "";
  position: absolute;
  left: 50%;
  top: -14px;
  width: 31px;
  height: 17px;
  transform: translateX(-50%);
  border: 3px solid #111827;
  border-radius: 999px;
  background:
    radial-gradient(
      ellipse at center,
      #dbeafe 0 31%,
      #7b8795 32% 37%,
      transparent 38%
    ),
    linear-gradient(
      180deg,
      #566170 0%,
      #26313e 46%,
      #050912 100%
    );
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,.16),
    inset 0 -1px 2px rgba(0,0,0,.2),
    0 2px 0 rgba(0,0,0,.16);
}

.handle::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 12px;
  height: 12px;
  transform: translateX(-50%);
  background: radial-gradient(
    circle at 35% 35%,
    #e5e7eb 0 13%,
    #6b7280 14% 42%,
    #1f2937 43% 100%
  );
  border: 3px solid #111827;
  border-radius: 50%;
  box-shadow:
    inset 1px 1px 0 rgba(255,255,255,.18),
    1px 2px 0 rgba(0,0,0,.2);
}

.jack-body {
  position: absolute;
  left: 25px;
  bottom: 30px;
  width: 40px;
  height: 29px;
  background: linear-gradient(
    145deg,
    #f87171 0%,
    #ef4444 45%,
    #991b1b 100%
  );
  border: 4px solid #7f1d1d;
  border-radius: 8px 8px 12px 12px;
  transform: skewX(-8deg);
  z-index: 5;
  box-shadow:
    inset 3px 3px 0 rgba(255,255,255,.16),
    3px 4px 0 rgba(0,0,0,.16);
}

.jack-body::before {
  content: "";
  position: absolute;
  left: -14px;
  bottom: 8px;
  width: 20px;
  height: 12px;
  background: linear-gradient(
    180deg,
    #7f8794 0%,
    #404955 55%,
    #1b2430 100%
  );
  border: 2px solid #111827;
  border-radius: 8px;
  transform: rotate(-18deg);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.18),
    1px 2px 0 rgba(0,0,0,.18);
}

.jack-body::after {
  content: "";
  position: absolute;
  right: 5px;
  top: 7px;
  width: 9px;
  height: 9px;
  background: #facc15;
  border: 2px solid #78350f;
  border-radius: 50%;
}

.load {
  position: absolute;
  left: 52px;
  bottom: 58px;
  width: 118px;
  height: 92px;
  z-index: 6;
  animation: loadShake 0.55s ease-in-out infinite;
}

.box {
  position: absolute;
  background: #b7791f;
  border: 3px solid #7c4a03;
  border-radius: 6px;
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,.16),
    2px 3px 0 rgba(0,0,0,.14);
}

.box::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  width: 4px;
  height: 100%;
  background: rgba(255,255,255,.28);
  transform: translateX(-50%);
}

.box::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  top: 50%;
  height: 4px;
  background: rgba(255,255,255,.22);
  transform: translateY(-50%);
}

.box-a {
  width: 58px;
  height: 44px;
  left: 0;
  bottom: 0;
}

.box-b {
  width: 58px;
  height: 44px;
  right: 0;
  bottom: 0;
}

.box-c {
  width: 70px;
  height: 42px;
  left: 24px;
  bottom: 42px;
  background: #c98728;
}

.pallet {
  position: absolute;
  left: 42px;
  bottom: 47px;
  width: 140px;
  height: 18px;
  background: linear-gradient(
    180deg,
    #a16207 0%,
    #8b5a2b 55%,
    #5f3518 100%
  );
  border: 2px solid #4a2a13;
  border-radius: 4px;
  z-index: 7;
  box-shadow:
    inset 0 3px 0 rgba(255,255,255,.16),
    0 3px 0 rgba(0,0,0,.2);
}

.pallet::before,
.pallet::after {
  content: "";
  position: absolute;
  bottom: -12px;
  width: 28px;
  height: 12px;
  background: linear-gradient(
    180deg,
    #7c4a1e 0%,
    #4a2a13 100%
  );
  border: 2px solid #3a1f0d;
  border-radius: 2px;
}

.pallet::before {
  left: 18px;
}

.pallet::after {
  right: 18px;
}

.pallet-slat {
  position: absolute;
  top: 0;
  width: 3px;
  height: 100%;
  background: rgba(74, 42, 19, .55);
}

.pallet-slat.one {
  left: 34px;
}

.pallet-slat.two {
  left: 68px;
}

.pallet-slat.three {
  left: 102px;
}

@keyframes bounce {
  0%, 100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -4px;
  }
}

@keyframes loadShake {
  0%, 100% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(-1deg) translateY(-2px);
  }
}

@keyframes wheelSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes floorMove {
  to {
    transform: translateX(-68px);
  }
}

@keyframes transportGaugeFill {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

@keyframes shadowPulse {
  0%, 100% {
    transform: scaleX(1);
    opacity: .22;
  }

  50% {
    transform: scaleX(.92);
    opacity: .16;
  }
}
</style>
</head>
<body>
  <div class="scene">
    <div class="transport-label">
      <div class="transport-gauge__label">운반중</div>
    </div>
    <div class="transport-gauge" aria-label="운반중 게이지">
      <div class="transport-gauge__track">
        <div class="transport-gauge__fill"></div>
      </div>
    </div>
    <div class="floor-line"></div>

    <div class="pallet-jack">
      <div class="shadow"></div>

      <div class="fork top"></div>
      <div class="fork"></div>

      <div class="wheel back"></div>
      <div class="wheel front"></div>

      <div class="handle"></div>
      <div class="jack-body"></div>

      <div class="load">
        <div class="box box-a"></div>
        <div class="box box-b"></div>
        <div class="box box-c"></div>
      </div>

      <div class="pallet">
        <span class="pallet-slat one"></span>
        <span class="pallet-slat two"></span>
        <span class="pallet-slat three"></span>
      </div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_FRUIT_CRATE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>과일 상자 사과 낙하 + 채움</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #f0f0f0;
    overflow: hidden;
  }
  .scene {
    position: relative;
    width: 560px;
    height: 520px;
    overflow: visible;
  }
  .harvest-progress {
    position: absolute;
    left: 50%;
    bottom: -28px;
    width: min(348px, 84vw);
    display: grid;
    gap: 6px;
    transform: translateX(-50%);
  }
  .harvest-progress__label {
    color: #8f4500;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .25px;
    text-align: center;
  }
  .harvest-progress__track {
    position: relative;
    height: 14px;
    border-radius: 999px;
    overflow: hidden;
    background: linear-gradient(to bottom, rgba(255,247,235,.94), rgba(255,210,149,.76));
    border: 1px solid rgba(191, 104, 12, 0.28);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.12), 0 2px 6px rgba(150, 81, 11, 0.16);
  }
  .harvest-progress__track::before {
    content: "";
    position: absolute;
    left: 6px;
    right: 6px;
    top: 3px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(255,255,255,.46), rgba(255,240,219,.12));
    pointer-events: none;
  }
  .harvest-progress__fill {
    position: relative;
    height: 100%;
    width: 0%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ffbe47 0%, #ff971d 55%, #e56d00 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.22), 0 0 10px rgba(242, 138, 17, 0.38);
    animation: harvestGaugeFill 10s linear forwards;
  }
  .harvest-progress__fill::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      120deg,
      rgba(255,255,255,.32) 0 10px,
      rgba(255,255,255,0) 10px 20px
    );
    animation: harvestGaugeStripe .85s linear infinite;
    mix-blend-mode: screen;
    pointer-events: none;
  }
  .harvest-progress__fill::after {
    content: "";
    position: absolute;
    top: -2px;
    bottom: -2px;
    right: -8px;
    width: 16px;
    border-radius: 999px;
    background: radial-gradient(ellipse at center, rgba(255,241,204,.96), rgba(255,173,56,0));
    animation: harvestGaugeGlow .9s ease-in-out infinite;
    pointer-events: none;
  }
  .crate {
    position: absolute;
    left: 50%;
    bottom: 42px;
    transform: translateX(-50%);
    width: 460px;
    height: 340px;
    border-radius: 18px;
    background: linear-gradient(to bottom, #ffad1f 0%, #ff9500 55%, #f27c00 100%);
    box-shadow:
      inset 0 8px 8px rgba(255,255,255,0.12),
      inset 0 -8px 12px rgba(0,0,0,0.08),
      0 12px 25px rgba(0,0,0,0.12);
    overflow: visible;
  }
  .apple-crate-preview__top-cap {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    height: 28px;
    border-radius: 10px;
    background: rgba(255, 186, 70, 0.82);
    box-shadow: inset 0 -3px 5px rgba(0,0,0,0.06);
    z-index: 5;
    transform: scale(0.96, 1);
    transform-origin: center center;
  }
  .inner-top {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 26px;
    height: 42px;
    border-radius: 10px 10px 12px 12px;
    background: linear-gradient(to bottom, rgba(255,160,16,0.95), rgba(255,147,0,0.88));
    box-shadow: inset 0 -4px 5px rgba(0,0,0,0.05);
    z-index: 4;
  }
  .handle {
    position: absolute;
    top: 36px;
    width: 54px;
    height: 22px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 3px 3px, transparent 2px, rgba(255,255,255,0.95) 2.5px, rgba(255,255,255,0.95) 3.2px, transparent 3.3px);
    background-size: 10px 10px;
    opacity: 0.75;
    z-index: 31;
  }
  .handle.h1 { left: 68px; }
  .handle.h2 { left: 130px; }
  .handle.h3 { left: 202px; width: 74px; }
  .handle.h4 { right: 130px; }
  .handle.h5 { right: 68px; }
  .bar {
    position: absolute;
    left: 18px;
    right: 18px;
    height: 6px;
    background: rgba(232, 110, 0, 0.95);
    border-radius: 4px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
    z-index: 32;
  }
  .bar.b1 {
    top: 96px;
    transform: translateY(-29px);
    z-index: 21;
  }
  .bar.b2 {
    top: 110px;
    transform: translateY(-32px);
    z-index: 20;
  }
  .bar.b3 {
    top: 124px;
    transform: translateY(-35px);
    z-index: 20;
  }
  .fill-clip {
    position: absolute;
    left: 26px;
    right: 26px;
    top: 92px;
    bottom: 18px;
    border-radius: 30px 30px 14px 14px / 22px 22px 10px 10px;
    overflow: hidden;
    z-index: 7;
  }
  .fill-clip::after {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: inherit;
    box-shadow:
      inset 0 0 18px 14px rgba(255, 152, 33, 0.18),
      inset 0 -10px 18px rgba(255, 176, 82, 0.1);
    filter: blur(7px);
    opacity: 0.9;
    pointer-events: none;
    z-index: 3;
  }
  .inside-fill {
    position: absolute;
    left: 2px;
    right: 2px;
    bottom: -10px;
    height: 252px;
    overflow: hidden;
    animation: fillInside 9s ease-in-out forwards;
    border-radius: 30px 30px 14px 14px / 22px 22px 10px 10px;
    box-shadow:
      inset 0 18px 28px rgba(0,0,0,0.22),
      inset 0 -8px 12px rgba(255,255,255,0.08);
  }
  .inside-fill-base {
    position: absolute;
    inset: 0;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") -6px -2px / 72px 72px repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") 40px 20px / 67px 67px repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") 12px 50px / 64px 64px repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") 54px 58px / 60px 60px repeat,
      linear-gradient(to bottom, rgba(124, 28, 18, 0.16), rgba(124, 28, 18, 0.16));
    opacity: 0.92;
    filter: brightness(0.72) saturate(0.8) blur(1.1px);
    transform: translateY(8px);
  }
  .inside-fill-top {
    position: absolute;
    left: -18px;
    right: -18px;
    top: -34px;
    height: 74px;
    transform: translateY(41px);
    border-radius: 999px;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.35)'/%3E%3C/svg%3E") -4px -8px / 60px 60px repeat-x,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.35)'/%3E%3C/svg%3E") 34px 14px / 56px 56px repeat-x,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.35)'/%3E%3C/svg%3E") 14px 28px / 52px 52px repeat-x,
      linear-gradient(to bottom, rgba(255, 181, 152, 0.12), rgba(176, 34, 21, 0.84) 66%, rgba(115, 17, 11, 0.9));
    box-shadow:
      inset 0 5px 8px rgba(255,255,255,0.08),
      0 8px 12px rgba(92, 16, 10, 0.16);
    opacity: 0.9;
    filter: brightness(0.68) saturate(0.78) blur(0.9px);
  }
  .inside-fill-top::after {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    top: -10px;
    height: 28px;
    border-radius: 999px;
    background: linear-gradient(to bottom, rgba(255, 175, 84, 0.26), rgba(255, 175, 84, 0));
    filter: blur(10px);
    opacity: 0.95;
    pointer-events: none;
  }
  .falling-apples {
    position: absolute;
    left: 50%;
    top: -320px;
    width: 400px;
    height: 520px;
    transform: translateX(-50%);
    z-index: 6;
    pointer-events: none;
  }
  .falling-apple {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 28%,
        #ffc7bc 0%,
        #f9704c 31%,
        #de311f 66%,
        #99170f 100%);
    box-shadow:
      inset -4px -5px 0 rgba(0,0,0,0.12),
      0 5px 10px rgba(0,0,0,0.18);
    opacity: 0;
  }
  .falling-apple::before {
    content: "";
    position: absolute;
    top: -7px;
    left: 22px;
    width: 4px;
    height: 12px;
    background: #6a4728;
    border-radius: 2px;
    transform: rotate(7deg);
  }
  .falling-apple::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 25px;
    width: 13px;
    height: 8px;
    background: #529f3d;
    border-radius: 10px 2px 10px 2px;
    transform: rotate(-25deg);
  }
  .f1 { left: 8px;   animation: fastFall1 0.9s linear 0.18s 10 forwards; }
  .f2 { left: 62px;  animation: fastFall2 0.8s linear 0.04s 10 forwards; }
  .f3 { left: 118px; animation: fastFall3 0.95s linear 0.29s 10 forwards; }
  .f4 { left: 174px; animation: fastFall4 0.85s linear 0.11s 10 forwards; }
  .f5 { left: 230px; animation: fastFall5 0.78s linear 0.24s 10 forwards; }
  .f6 { left: 286px; animation: fastFall6 0.92s linear 0s 10 forwards; }
  .f7 { left: 342px; animation: fastFall7 0.82s linear 0.21s 10 forwards; }
  .grid-area {
    position: absolute;
    left: 22px;
    right: 22px;
    top: 92px;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
    gap: 8px;
    z-index: 10;
  }
  .col {
    position: relative;
    border-left: 4px solid rgba(230,110,0,0.95);
    border-right: 4px solid rgba(230,110,0,0.95);
    border-radius: 4px;
  }
  .col::before,
  .col::after {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    height: 4px;
    background: rgba(230,110,0,0.95);
  }
  .col::before { top: 72px; }
  .col::after  { bottom: 68px; }
  .mesh {
    position: absolute;
    left: 6px;
    right: 6px;
    top: 6px;
    bottom: 18px;
    background:
      repeating-linear-gradient(45deg,
        rgba(255, 188, 80, 0.95) 0 2px,
        transparent 2px 8px),
      repeating-linear-gradient(-45deg,
        rgba(255, 188, 80, 0.95) 0 2px,
        transparent 2px 8px);
    opacity: 0.72;
  }
  .vline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgba(230,110,0,0.95);
  }
  .v1 { left: 33%; }
  .v2 { left: 66%; }
  .center-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 94px;
    width: 78px;
    height: 128px;
    background: linear-gradient(to bottom, #ff9d12, #f48700);
    border: 4px solid rgba(230,110,0,0.95);
    border-radius: 4px;
    z-index: 20;
    box-shadow: inset 0 2px 5px rgba(255,255,255,0.16);
  }
  .bottom-row {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    height: 54px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    z-index: 21;
  }
  .bottom-cell {
    position: relative;
    border: 4px solid rgba(230,110,0,0.95);
    border-radius: 4px;
    overflow: hidden;
  }
  .bottom-cell::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(45deg,
        rgba(255, 188, 80, 0.95) 0 2px,
        transparent 2px 7px),
      repeating-linear-gradient(-45deg,
        rgba(255, 188, 80, 0.95) 0 2px,
        transparent 2px 7px);
    opacity: 0.65;
  }
  .side-frame {
    position: absolute;
    top: 64px;
    bottom: 14px;
    width: 18px;
    border-radius: 8px;
    background: linear-gradient(to right, #f48a00, #ffad1f, #f48a00);
    z-index: 22;
  }
  .side-frame.left { left: 8px; }
  .side-frame.right { right: 8px; }
  .corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 5px solid rgba(230,110,0,0.95);
    border-top: none;
    border-left: none;
    border-radius: 0 0 10px 0;
    opacity: 0.65;
    z-index: 22;
  }
  .corner.c1 {
    left: 8px;
    bottom: 8px;
    transform: scaleX(-1);
  }
  .corner.c2 {
    right: 8px;
    bottom: 8px;
  }
  @keyframes fillInside {
    0%   { transform: translateY(252px); }
    15%  { transform: translateY(228px); }
    35%  { transform: translateY(164px); }
    55%  { transform: translateY(108px); }
    75%  { transform: translateY(56px); }
    100% { transform: translateY(0); }
  }
  @keyframes fastFall1 {
    0%   { transform: translateY(0) rotate(-10deg); opacity: 0; }
    5%   { opacity: 1; }
    66%  { transform: translateY(566px) rotate(8deg); opacity: 1; }
    82%  { opacity: 0; }
    100% { transform: translateY(566px) rotate(8deg); opacity: 0; }
  }
  @keyframes fastFall2 {
    0%   { transform: translateY(-25px) rotate(9deg); opacity: 0; }
    6%   { opacity: 1; }
    67%  { transform: translateY(584px) rotate(-6deg); opacity: 1; }
    83%  { opacity: 0; }
    100% { transform: translateY(584px) rotate(-6deg); opacity: 0; }
  }
  @keyframes fastFall3 {
    0%   { transform: translateY(-10px) rotate(-12deg); opacity: 0; }
    6%   { opacity: 1; }
    66%  { transform: translateY(574px) rotate(6deg); opacity: 1; }
    83%  { opacity: 0; }
    100% { transform: translateY(574px) rotate(6deg); opacity: 0; }
  }
  @keyframes fastFall4 {
    0%   { transform: translateY(-30px) rotate(10deg); opacity: 0; }
    5%   { opacity: 1; }
    68%  { transform: translateY(592px) rotate(-5deg); opacity: 1; }
    84%  { opacity: 0; }
    100% { transform: translateY(592px) rotate(-5deg); opacity: 0; }
  }
  @keyframes fastFall5 {
    0%   { transform: translateY(-18px) rotate(-8deg); opacity: 0; }
    5%   { opacity: 1; }
    66%  { transform: translateY(572px) rotate(7deg); opacity: 1; }
    82%  { opacity: 0; }
    100% { transform: translateY(572px) rotate(7deg); opacity: 0; }
  }
  @keyframes fastFall6 {
    0%   { transform: translateY(-35px) rotate(11deg); opacity: 0; }
    6%   { opacity: 1; }
    68%  { transform: translateY(590px) rotate(-7deg); opacity: 1; }
    84%  { opacity: 0; }
    100% { transform: translateY(590px) rotate(-7deg); opacity: 0; }
  }
  @keyframes fastFall7 {
    0%   { transform: translateY(-15px) rotate(-9deg); opacity: 0; }
    5%   { opacity: 1; }
    67%  { transform: translateY(578px) rotate(5deg); opacity: 1; }
    83%  { opacity: 0; }
    100% { transform: translateY(578px) rotate(5deg); opacity: 0; }
  }
  @keyframes harvestGaugeFill { from { width: 0%; } to { width: 100%; } }
  @keyframes harvestGaugeStripe { from { transform: translateX(0); } to { transform: translateX(20px); } }
  @keyframes harvestGaugeGlow { 0%,100% { opacity: .48; } 50% { opacity: .9; } }
</style>
</head>
<body>
  <div class="scene">
    <div class="harvest-progress" aria-hidden="true">
      <div class="harvest-progress__label">수확중</div>
      <div class="harvest-progress__track">
        <div class="harvest-progress__fill"></div>
      </div>
    </div>
    <div class="crate">
      <div class="apple-crate-preview__top-cap"></div>
      <div class="inner-top"></div>
      <div class="fill-clip">
        <div class="inside-fill">
          <div class="inside-fill-base"></div>
          <div class="inside-fill-top"></div>
        </div>
      </div>
      <div class="falling-apples">
        <div class="falling-apple f1"></div>
        <div class="falling-apple f2"></div>
        <div class="falling-apple f3"></div>
        <div class="falling-apple f4"></div>
        <div class="falling-apple f5"></div>
        <div class="falling-apple f6"></div>
        <div class="falling-apple f7"></div>
      </div>
      <div class="handle h1"></div>
      <div class="handle h2"></div>
      <div class="handle h3"></div>
      <div class="handle h4"></div>
      <div class="handle h5"></div>
      <div class="bar b1"></div>
      <div class="bar b2"></div>
      <div class="bar b3"></div>
      <div class="grid-area">
        <div class="col">
          <div class="vline v1"></div>
          <div class="vline v2"></div>
          <div class="mesh"></div>
        </div>
        <div class="col">
          <div class="vline v1"></div>
          <div class="vline v2"></div>
          <div class="mesh"></div>
        </div>
        <div class="col"></div>
        <div class="col">
          <div class="vline v1"></div>
          <div class="vline v2"></div>
          <div class="mesh"></div>
        </div>
        <div class="col">
          <div class="vline v1"></div>
          <div class="vline v2"></div>
          <div class="mesh"></div>
        </div>
      </div>
      <div class="center-panel"></div>
      <div class="bottom-row">
        <div class="bottom-cell"></div>
        <div class="bottom-cell"></div>
        <div class="bottom-cell"></div>
        <div class="bottom-cell"></div>
        <div class="bottom-cell"></div>
        <div class="bottom-cell"></div>
      </div>
      <div class="side-frame left"></div>
      <div class="side-frame right"></div>
      <div class="corner c1"></div>
      <div class="corner c2"></div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_APPLE_CRATE_FULL_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>노란색 사과 컨테이너</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 246, 218, 0.92), transparent 32%),
      linear-gradient(180deg, #f4ead3 0%, #e4d0ab 54%, #caa06c 100%);
    overflow: hidden;
  }
  .scene {
    position: relative;
    width: 620px;
    height: 520px;
  }
  .shadow {
    position: absolute;
    left: 94px;
    right: 94px;
    bottom: 28px;
    height: 42px;
    border-radius: 50%;
    background: rgba(76, 45, 19, 0.22);
    filter: blur(14px);
  }
  .apple-crate-preview {
    position: absolute;
    left: 50%;
    bottom: 48px;
    width: 470px;
    height: 350px;
    transform: translateX(-50%);
    overflow: visible;
    --crate-scale: 1;
    --crate-bg-top: #ffad1f;
    --crate-bg-mid: #ff9500;
    --crate-bg-bot: #f27c00;
    --crate-rib: rgba(230, 110, 0, 0.95);
    --crate-mesh: rgba(255, 188, 80, 0.9);
    --crate-inner-top: #ff9c10;
    --crate-inner-bottom: #ff9300;
    --crate-top-cap: rgba(255, 190, 80, 0.95);
    --crate-top-hole: rgba(255, 255, 255, 0.95);
    --crate-side-frame-a: #f48a00;
    --crate-side-frame-b: #ffad1f;
    animation: crateIdle 4.8s ease-in-out infinite;
  }
  .apple-crate-preview__model {
    position: absolute;
    left: 0;
    top: 0;
    width: 460px;
    height: 340px;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--crate-bg-top) 0%, var(--crate-bg-mid) 55%, var(--crate-bg-bot) 100%);
    box-shadow:
      inset 0 10px 10px rgba(255,255,255,0.18),
      inset 0 -8px 12px rgba(0,0,0,0.08),
      0 12px 25px rgba(0,0,0,0.18);
    transform-origin: top left;
    transform: scale(var(--crate-scale));
  }
  .apple-crate-preview__top-cap {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    height: 34px;
    border-radius: 10px;
    background: var(--crate-top-cap);
    box-shadow: inset 0 -6px 8px rgba(0,0,0,0.08);
    z-index: 5;
  }
  .apple-crate-preview__inner-top {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 26px;
    height: 62px;
    border-radius: 10px 10px 18px 18px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    box-shadow: inset 0 -8px 8px rgba(0, 0, 0, 0.08);
    z-index: 5;
  }
  .apple-crate-preview__handle {
    position: absolute;
    top: 36px;
    width: 54px;
    height: 22px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 3px 3px, transparent 2px, var(--crate-top-hole) 2.5px, var(--crate-top-hole) 3.2px, transparent 3.3px);
    background-size: 10px 10px;
    opacity: 0.75;
  }
  .apple-crate-preview__handle--1 { left: 68px; }
  .apple-crate-preview__handle--2 { left: 130px; }
  .apple-crate-preview__handle--3 { left: 202px; width: 74px; }
  .apple-crate-preview__handle--4 { right: 130px; }
  .apple-crate-preview__handle--5 { right: 68px; }
  .apple-crate-preview__bar {
    position: absolute;
    left: 18px;
    right: 18px;
    height: 6px;
    background: var(--crate-rib);
    border-radius: 4px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .apple-crate-preview__bar--1 { top: 96px; }
  .apple-crate-preview__bar--2 { top: 110px; }
  .apple-crate-preview__bar--3 { top: 124px; }
  .apple-crate-preview__grid-area {
    position: absolute;
    left: 22px;
    right: 22px;
    top: 92px;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
    gap: 8px;
    z-index: 3;
  }
  .apple-crate-preview__col {
    position: relative;
    border-left: 4px solid var(--crate-rib);
    border-right: 4px solid var(--crate-rib);
    border-radius: 4px;
  }
  .apple-crate-preview__col::before,
  .apple-crate-preview__col::after {
    content: '';
    position: absolute;
    left: -4px;
    right: -4px;
    height: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__col::before { top: 72px; }
  .apple-crate-preview__col::after { bottom: 68px; }
  .apple-crate-preview__mesh {
    position: absolute;
    left: 6px;
    right: 6px;
    top: 48px;
    bottom: 18px;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 8px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 8px);
    opacity: 0.55;
  }
  .apple-crate-preview__vline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__vline--1 { left: 33%; }
  .apple-crate-preview__vline--2 { left: 66%; }
  .apple-crate-preview__center-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 94px;
    width: 78px;
    height: 128px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    z-index: 4;
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.16);
  }
  .apple-crate-preview__bottom-row {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    height: 54px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    z-index: 4;
  }
  .apple-crate-preview__bottom-cell {
    position: relative;
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    overflow: hidden;
  }
  .apple-crate-preview__bottom-cell::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 7px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 7px);
    opacity: 0.65;
  }
  .apple-crate-preview__side-frame {
    position: absolute;
    top: 64px;
    bottom: 14px;
    width: 18px;
    border-radius: 8px;
    background: linear-gradient(to right, var(--crate-side-frame-a), var(--crate-side-frame-b), var(--crate-side-frame-a));
    z-index: 4;
  }
  .apple-crate-preview__side-frame--left { left: 8px; }
  .apple-crate-preview__side-frame--right { right: 8px; }
  .apple-crate-preview__corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 5px solid var(--crate-rib);
    border-top: none;
    border-left: none;
    border-radius: 0 0 10px 0;
    opacity: 0.65;
    z-index: 4;
  }
  .apple-crate-preview__corner--1 {
    left: 8px;
    bottom: 8px;
    transform: scaleX(-1);
  }
  .apple-crate-preview__corner--2 {
    right: 8px;
    bottom: 8px;
  }
  @keyframes crateIdle {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-4px); }
  }
</style>
</head>
<body>
  <div class="scene">
    <div class="shadow"></div>
    <div class="apple-crate-preview apple-crate-preview--yellow">
      <div class="apple-crate-preview__model">
        <div class="apple-crate-preview__top-cap"></div>
        <div class="apple-crate-preview__inner-top" style="transform: translate(0px, 64px) scale(1.09, 1); z-index: 3;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--1"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--2"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--3"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--4"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--5"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--1"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--2"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--3"></div>
        <div class="apple-crate-preview__grid-area">
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col"></div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
        </div>
        <div class="apple-crate-preview__center-panel"></div>
        <div class="apple-crate-preview__bottom-row">
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
        </div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--left"></div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--right"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--1"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--2"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_APPLE_CRATE_PACKED_HTML = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>노란 컨테이너 사과 적재</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 246, 218, 0.92), transparent 32%),
      linear-gradient(180deg, #f4ead3 0%, #e4d0ab 54%, #caa06c 100%);
    overflow: hidden;
  }
  .scene {
    position: relative;
    width: 620px;
    height: 520px;
  }
  .shadow {
    position: absolute;
    left: 94px;
    right: 94px;
    bottom: 28px;
    height: 42px;
    border-radius: 50%;
    background: rgba(76, 45, 19, 0.22);
    filter: blur(14px);
  }
  .apple-crate-preview {
    position: absolute;
    left: 50%;
    bottom: 48px;
    width: 470px;
    height: 350px;
    transform: translateX(-50%);
    overflow: visible;
    --crate-scale: 1;
    --crate-bg-top: #ffad1f;
    --crate-bg-mid: #ff9500;
    --crate-bg-bot: #f27c00;
    --crate-rib: rgba(230, 110, 0, 0.95);
    --crate-mesh: rgba(255, 188, 80, 0.9);
    --crate-inner-top: #ff9c10;
    --crate-inner-bottom: #ff9300;
    --crate-top-cap: rgba(255, 190, 80, 0.95);
    --crate-top-hole: rgba(255, 255, 255, 0.95);
    --crate-side-frame-a: #f48a00;
    --crate-side-frame-b: #ffad1f;
    animation: crateIdlePacked 4.8s ease-in-out infinite;
  }
  .apple-crate-preview__model {
    position: absolute;
    left: 0;
    top: 0;
    width: 460px;
    height: 340px;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--crate-bg-top) 0%, var(--crate-bg-mid) 55%, var(--crate-bg-bot) 100%);
    box-shadow:
      inset 0 10px 10px rgba(255,255,255,0.18),
      inset 0 -8px 12px rgba(0,0,0,0.08),
      0 12px 25px rgba(0,0,0,0.18);
    transform-origin: top left;
    transform: scale(var(--crate-scale));
  }
  .apple-crate-preview__top-cap {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    height: 34px;
    border-radius: 10px;
    background: var(--crate-top-cap);
    box-shadow: inset 0 -6px 8px rgba(0,0,0,0.08);
    z-index: 5;
  }
  .apple-crate-preview__inner-top {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 26px;
    height: 62px;
    border-radius: 10px 10px 18px 18px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    box-shadow: inset 0 -8px 8px rgba(0, 0, 0, 0.08);
    z-index: 5;
  }
  .apple-crate-preview__load {
    position: absolute;
    left: 30px;
    right: 30px;
    top: 34px;
    height: 108px;
    overflow: visible;
    border-radius: 12px 12px 22px 22px;
    z-index: 1;
    background:
      linear-gradient(180deg, rgba(255, 184, 74, 0.1) 0%, rgba(145, 54, 8, 0.1) 100%);
    box-shadow:
      inset 0 -16px 18px rgba(128, 48, 8, 0.18),
      inset 0 10px 10px rgba(255, 214, 164, 0.08);
  }
  .apple-crate-preview__load::before {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    bottom: -6px;
    height: 72px;
    border-radius: 40px 40px 14px 14px;
    background:
      radial-gradient(circle at 20px 22px, #ffd4c6 0%, #ff9b7a 24%, #ef643b 48%, #cf351f 72%, #99170f 100%) 0 0 / 44px 44px repeat-x,
      radial-gradient(circle at 22px 24px, rgba(255, 244, 229, 0.58) 0 4px, transparent 5px) 0 0 / 44px 44px repeat-x;
    opacity: 0.98;
  }
  .apple-crate-preview__load::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 18px;
    height: 48px;
    border-radius: 999px;
    background: rgba(120, 34, 8, 0.12);
    filter: blur(8px);
  }
  .apple-crate-preview__inner-fill-clip {
    position: absolute;
    left: 32px;
    right: 32px;
    top: 118px;
    height: 124px;
    overflow: hidden;
    border-radius: 14px 14px 20px 20px;
    z-index: 2;
    pointer-events: none;
  }
  .apple-crate-preview__inner-fill {
    position: absolute;
    inset: 0;
    transform-origin: 50% 100%;
    pointer-events: none;
  }
  .apple-crate-preview__inner-fill::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    height: 86px;
    border-radius: 26px 26px 14px 14px;
    background:
      radial-gradient(circle at 22px 22px, #ffd4c6 0%, #ff9b7a 24%, #ef643b 48%, #cf351f 72%, #99170f 100%) 0 0 / 42px 42px repeat,
      radial-gradient(circle at 18px 16px, rgba(255, 242, 230, 0.35) 0 4px, transparent 5px) 0 0 / 42px 42px repeat;
    opacity: 0.48;
    filter: saturate(0.94) brightness(0.98);
  }
  .apple-crate-preview__inner-fill::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 2px;
    height: 76px;
    border-radius: 999px;
    background: rgba(110, 34, 10, 0.12);
    filter: blur(10px);
  }
  .apple-crate-preview__apple {
    position: absolute;
    width: var(--size);
    height: var(--size);
    left: var(--x);
    top: var(--y);
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 28%, #ffe1d6 0%, #ffab8d 18%, #f86c46 42%, #d54025 68%, #a61e12 100%);
    box-shadow:
      inset -7px -8px 0 rgba(123, 25, 15, 0.16),
      0 10px 14px rgba(126, 38, 12, 0.18);
    transform: translateZ(0);
  }
  .apple-crate-preview__apple::before {
    content: "";
    position: absolute;
    left: calc(50% - 2px);
    top: -7px;
    width: 4px;
    height: 14px;
    border-radius: 999px;
    background: #6e4723;
    transform: rotate(10deg);
  }
  .apple-crate-preview__apple::after {
    content: "";
    position: absolute;
    left: calc(50% + 1px);
    top: -6px;
    width: 14px;
    height: 8px;
    border-radius: 10px 2px 10px 2px;
    background: #6ca33d;
    transform: rotate(-26deg);
  }
  .apple-crate-preview__apple--a { --size: 48px; --x: 6px; --y: 10px; }
  .apple-crate-preview__apple--b { --size: 54px; --x: 44px; --y: 4px; }
  .apple-crate-preview__apple--c { --size: 50px; --x: 88px; --y: 14px; }
  .apple-crate-preview__apple--d { --size: 58px; --x: 128px; --y: 0px; }
  .apple-crate-preview__apple--e { --size: 52px; --x: 178px; --y: 12px; }
  .apple-crate-preview__apple--f { --size: 50px; --x: 220px; --y: 6px; }
  .apple-crate-preview__apple--g { --size: 56px; --x: 260px; --y: 10px; }
  .apple-crate-preview__apple--h { --size: 52px; --x: 308px; --y: 2px; }
  .apple-crate-preview__apple--i { --size: 48px; --x: 352px; --y: 14px; }
  .apple-crate-preview__apple--j { --size: 54px; --x: 388px; --y: 8px; }
  .apple-crate-preview__apple--k { --size: 46px; --x: 28px; --y: 36px; }
  .apple-crate-preview__apple--l { --size: 52px; --x: 76px; --y: 42px; }
  .apple-crate-preview__apple--m { --size: 48px; --x: 132px; --y: 40px; }
  .apple-crate-preview__apple--n { --size: 54px; --x: 182px; --y: 44px; }
  .apple-crate-preview__apple--o { --size: 50px; --x: 236px; --y: 38px; }
  .apple-crate-preview__apple--p { --size: 54px; --x: 290px; --y: 44px; }
  .apple-crate-preview__apple--q { --size: 50px; --x: 344px; --y: 38px; }
  .apple-crate-preview__apple--r { --size: 48px; --x: 386px; --y: 44px; }
  .apple-crate-preview__handle {
    position: absolute;
    top: 36px;
    width: 54px;
    height: 22px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 3px 3px, transparent 2px, var(--crate-top-hole) 2.5px, var(--crate-top-hole) 3.2px, transparent 3.3px);
    background-size: 10px 10px;
    opacity: 0.82;
    z-index: 3;
  }
  .apple-crate-preview__handle--1 { left: 68px; }
  .apple-crate-preview__handle--2 { left: 130px; }
  .apple-crate-preview__handle--3 { left: 202px; width: 74px; }
  .apple-crate-preview__handle--4 { right: 130px; }
  .apple-crate-preview__handle--5 { right: 68px; }
  .apple-crate-preview__bar {
    position: absolute;
    left: 18px;
    right: 18px;
    height: 6px;
    background: var(--crate-rib);
    border-radius: 4px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
    z-index: 4;
  }
  .apple-crate-preview__bar--1 { top: 96px; }
  .apple-crate-preview__bar--2 { top: 110px; }
  .apple-crate-preview__bar--3 { top: 124px; }
  .apple-crate-preview__grid-area {
    position: absolute;
    left: 22px;
    right: 22px;
    top: 92px;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
    gap: 8px;
    z-index: 3;
  }
  .apple-crate-preview__col {
    position: relative;
    border-left: 4px solid var(--crate-rib);
    border-right: 4px solid var(--crate-rib);
    border-radius: 4px;
  }
  .apple-crate-preview__col::before,
  .apple-crate-preview__col::after {
    content: '';
    position: absolute;
    left: -4px;
    right: -4px;
    height: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__col::before { top: 72px; }
  .apple-crate-preview__col::after { bottom: 68px; }
  .apple-crate-preview__mesh {
    position: absolute;
    left: 6px;
    right: 6px;
    top: 48px;
    bottom: 18px;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 8px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 8px);
    opacity: 0.55;
  }
  .apple-crate-preview__vline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__vline--1 { left: 33%; }
  .apple-crate-preview__vline--2 { left: 66%; }
  .apple-crate-preview__center-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 94px;
    width: 78px;
    height: 128px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    z-index: 4;
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.16);
  }
  .apple-crate-preview__bottom-row {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    height: 54px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    z-index: 4;
  }
  .apple-crate-preview__bottom-cell {
    position: relative;
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    overflow: hidden;
  }
  .apple-crate-preview__bottom-cell::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 7px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 7px);
    opacity: 0.65;
  }
  .apple-crate-preview__side-frame {
    position: absolute;
    top: 64px;
    bottom: 14px;
    width: 18px;
    border-radius: 8px;
    background: linear-gradient(to right, var(--crate-side-frame-a), var(--crate-side-frame-b), var(--crate-side-frame-a));
    z-index: 4;
  }
  .apple-crate-preview__side-frame--left { left: 8px; }
  .apple-crate-preview__side-frame--right { right: 8px; }
  .apple-crate-preview__corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 5px solid var(--crate-rib);
    border-top: none;
    border-left: none;
    border-radius: 0 0 10px 0;
    opacity: 0.65;
    z-index: 4;
  }
  .apple-crate-preview__corner--1 {
    left: 8px;
    bottom: 8px;
    transform: scaleX(-1);
  }
  .apple-crate-preview__corner--2 {
    right: 8px;
    bottom: 8px;
  }
  @keyframes crateIdlePacked {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(0); }
  }
</style>
</head>
<body>
  <div class="scene" style="transform: translate(-41px, 0px);">
    <div class="shadow"></div>
    <div class="apple-crate-preview apple-crate-preview--yellow">
      <div class="apple-crate-preview__model">
        <div class="apple-crate-preview__top-cap" style="z-index: 0;"></div>
        <div class="apple-crate-preview__inner-top" style="transform: translate(0px, 64px) scale(1.07, 1); z-index: 2;"></div>
        <div class="apple-crate-preview__load">
          <div class="apple-crate-preview__apple apple-crate-preview__apple--a" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--b" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--c" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--d"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--e" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--f"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--g"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--h"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--i"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--k" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--l" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--m" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--n"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--o" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--p" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--q" style="z-index: 0;"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.76; transform: translate(0px, -12px) translate(0px, -87px) translate(0px, 70px); z-index: -3;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 28px) scale(1.14, 1.24);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.88; transform: translate(0px, 6px) translate(0px, 6px) translate(0px, 47px) scale(1.01, 1.29); z-index: -2;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 66px) scale(1.08, 1.64);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.92; transform: translate(0px, 6px) translate(0px, 70px) scale(1, 0.79) translate(0px, -29px); z-index: -4;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 110px) scale(1.18, 2.02);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.7; transform: translate(0px, -12px) translate(0px, -47px) translate(0px, 18px) scale(0.96, 1.08); z-index: -3;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 42px) scale(1.02, 1.32);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.84; transform: translate(0px, 6px) translate(0px, 41px) scale(0.94, 0.55) translate(0px, 86px) scale(1.04, 1.18); z-index: -10;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 92px) scale(1.12, 1.78);"></div>
        </div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--1" style="z-index: 0; transform: translate(-29px, 0px);"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--2" style="z-index: 0; transform: translate(-17px, 0px);"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--3" style="z-index: 0;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--4" style="z-index: 0; transform: translate(23px, 0px);"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--5" style="z-index: 0; transform: translate(35px, 0px);"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--1"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--2"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--3"></div>
        <div class="apple-crate-preview__grid-area">
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col"></div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
        </div>
        <div class="apple-crate-preview__center-panel"></div>
        <div class="apple-crate-preview__bottom-row">
          <div class="apple-crate-preview__bottom-cell" style="transform: translate(0px, 0px);"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
        </div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--left"></div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--right"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--1"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--2"></div>
      </div>
    </div>
  </div>

</body></html>`;

export const ANIMATION_LAB_APPLE_CRATE_ONE_THIRD_HTML = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>노란 컨테이너 사과 적재</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 246, 218, 0.92), transparent 32%),
      linear-gradient(180deg, #f4ead3 0%, #e4d0ab 54%, #caa06c 100%);
    overflow: hidden;
  }
  .scene {
    position: relative;
    width: 620px;
    height: 520px;
  }
  .shadow {
    position: absolute;
    left: 94px;
    right: 94px;
    bottom: 28px;
    height: 42px;
    border-radius: 50%;
    background: rgba(76, 45, 19, 0.22);
    filter: blur(14px);
  }
  .apple-crate-preview {
    position: absolute;
    left: 50%;
    bottom: 48px;
    width: 470px;
    height: 350px;
    transform: translateX(-50%);
    overflow: visible;
    --crate-scale: 1;
    --crate-bg-top: #ffad1f;
    --crate-bg-mid: #ff9500;
    --crate-bg-bot: #f27c00;
    --crate-rib: rgba(230, 110, 0, 0.95);
    --crate-mesh: rgba(255, 188, 80, 0.9);
    --crate-inner-top: #ff9c10;
    --crate-inner-bottom: #ff9300;
    --crate-top-cap: rgba(255, 190, 80, 0.95);
    --crate-top-hole: rgba(255, 255, 255, 0.95);
    --crate-side-frame-a: #f48a00;
    --crate-side-frame-b: #ffad1f;
    animation: crateIdlePacked 4.8s ease-in-out infinite;
  }
  .apple-crate-preview__model {
    position: absolute;
    left: 0;
    top: 0;
    width: 460px;
    height: 340px;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--crate-bg-top) 0%, var(--crate-bg-mid) 55%, var(--crate-bg-bot) 100%);
    box-shadow:
      inset 0 10px 10px rgba(255,255,255,0.18),
      inset 0 -8px 12px rgba(0,0,0,0.08),
      0 12px 25px rgba(0,0,0,0.18);
    transform-origin: top left;
    transform: scale(var(--crate-scale));
  }
  .apple-crate-preview__top-cap {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    height: 34px;
    border-radius: 10px;
    background: var(--crate-top-cap);
    box-shadow: inset 0 -6px 8px rgba(0,0,0,0.08);
  }
  .apple-crate-preview__inner-top {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 26px;
    height: 62px;
    border-radius: 10px 10px 18px 18px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    box-shadow: inset 0 -8px 8px rgba(0, 0, 0, 0.08);
  }
  .apple-crate-preview__load {
    position: absolute;
    left: 30px;
    right: 30px;
    top: 34px;
    height: 108px;
    overflow: visible;
    border-radius: 12px 12px 22px 22px;
    z-index: 1;
    background:
      linear-gradient(180deg, rgba(255, 184, 74, 0.1) 0%, rgba(145, 54, 8, 0.1) 100%);
    box-shadow:
      inset 0 -16px 18px rgba(128, 48, 8, 0.18),
      inset 0 10px 10px rgba(255, 214, 164, 0.08);
  }
  .apple-crate-preview__load::before {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    bottom: -6px;
    height: 72px;
    border-radius: 40px 40px 14px 14px;
    background:
      radial-gradient(circle at 20px 22px, #ffd4c6 0%, #ff9b7a 24%, #ef643b 48%, #cf351f 72%, #99170f 100%) 0 0 / 44px 44px repeat-x,
      radial-gradient(circle at 22px 24px, rgba(255, 244, 229, 0.58) 0 4px, transparent 5px) 0 0 / 44px 44px repeat-x;
    opacity: 0.98;
  }
  .apple-crate-preview__load::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 18px;
    height: 48px;
    border-radius: 999px;
    background: rgba(120, 34, 8, 0.12);
    filter: blur(8px);
  }
  .apple-crate-preview__inner-fill-clip {
    position: absolute;
    left: 32px;
    right: 32px;
    top: 118px;
    height: 124px;
    overflow: hidden;
    border-radius: 14px 14px 20px 20px;
    z-index: 2;
    pointer-events: none;
  }
  .apple-crate-preview__inner-fill {
    position: absolute;
    inset: 0;
    transform-origin: 50% 100%;
    pointer-events: none;
  }
  .apple-crate-preview__inner-fill::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    height: 86px;
    border-radius: 26px 26px 14px 14px;
    background:
      radial-gradient(circle at 22px 22px, #ffd4c6 0%, #ff9b7a 24%, #ef643b 48%, #cf351f 72%, #99170f 100%) 0 0 / 42px 42px repeat,
      radial-gradient(circle at 18px 16px, rgba(255, 242, 230, 0.35) 0 4px, transparent 5px) 0 0 / 42px 42px repeat;
    opacity: 0.48;
    filter: saturate(0.94) brightness(0.98);
  }
  .apple-crate-preview__inner-fill::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 2px;
    height: 76px;
    border-radius: 999px;
    background: rgba(110, 34, 10, 0.12);
    filter: blur(10px);
  }
  .apple-crate-preview__apple {
    position: absolute;
    width: var(--size);
    height: var(--size);
    left: var(--x);
    top: var(--y);
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 28%, #ffe1d6 0%, #ffab8d 18%, #f86c46 42%, #d54025 68%, #a61e12 100%);
    box-shadow:
      inset -7px -8px 0 rgba(123, 25, 15, 0.16),
      0 10px 14px rgba(126, 38, 12, 0.18);
    transform: translateZ(0);
  }
  .apple-crate-preview__apple::before {
    content: "";
    position: absolute;
    left: calc(50% - 2px);
    top: -7px;
    width: 4px;
    height: 14px;
    border-radius: 999px;
    background: #6e4723;
    transform: rotate(10deg);
  }
  .apple-crate-preview__apple::after {
    content: "";
    position: absolute;
    left: calc(50% + 1px);
    top: -6px;
    width: 14px;
    height: 8px;
    border-radius: 10px 2px 10px 2px;
    background: #6ca33d;
    transform: rotate(-26deg);
  }
  .apple-crate-preview__apple--a { --size: 48px; --x: 6px; --y: 10px; }
  .apple-crate-preview__apple--b { --size: 54px; --x: 44px; --y: 4px; }
  .apple-crate-preview__apple--c { --size: 50px; --x: 88px; --y: 14px; }
  .apple-crate-preview__apple--d { --size: 58px; --x: 128px; --y: 0px; }
  .apple-crate-preview__apple--e { --size: 52px; --x: 178px; --y: 12px; }
  .apple-crate-preview__apple--f { --size: 50px; --x: 220px; --y: 6px; }
  .apple-crate-preview__apple--g { --size: 56px; --x: 260px; --y: 10px; }
  .apple-crate-preview__apple--h { --size: 52px; --x: 308px; --y: 2px; }
  .apple-crate-preview__apple--i { --size: 48px; --x: 352px; --y: 14px; }
  .apple-crate-preview__apple--j { --size: 54px; --x: 388px; --y: 8px; }
  .apple-crate-preview__apple--k { --size: 46px; --x: 28px; --y: 36px; }
  .apple-crate-preview__apple--l { --size: 52px; --x: 76px; --y: 42px; }
  .apple-crate-preview__apple--m { --size: 48px; --x: 132px; --y: 40px; }
  .apple-crate-preview__apple--n { --size: 54px; --x: 182px; --y: 44px; }
  .apple-crate-preview__apple--o { --size: 50px; --x: 236px; --y: 38px; }
  .apple-crate-preview__apple--p { --size: 54px; --x: 290px; --y: 44px; }
  .apple-crate-preview__apple--q { --size: 50px; --x: 344px; --y: 38px; }
  .apple-crate-preview__apple--r { --size: 48px; --x: 386px; --y: 44px; }
  .apple-crate-preview__handle {
    position: absolute;
    top: 36px;
    width: 54px;
    height: 22px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 3px 3px, transparent 2px, var(--crate-top-hole) 2.5px, var(--crate-top-hole) 3.2px, transparent 3.3px);
    background-size: 10px 10px;
    opacity: 0.82;
    z-index: 3;
  }
  .apple-crate-preview__handle--1 { left: 68px; }
  .apple-crate-preview__handle--2 { left: 130px; }
  .apple-crate-preview__handle--3 { left: 202px; width: 74px; }
  .apple-crate-preview__handle--4 { right: 130px; }
  .apple-crate-preview__handle--5 { right: 68px; }
  .apple-crate-preview__bar {
    position: absolute;
    left: 18px;
    right: 18px;
    height: 6px;
    background: var(--crate-rib);
    border-radius: 4px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
    z-index: 4;
  }
  .apple-crate-preview__bar--1 { top: 96px; }
  .apple-crate-preview__bar--2 { top: 110px; }
  .apple-crate-preview__bar--3 { top: 124px; }
  .apple-crate-preview__grid-area {
    position: absolute;
    left: 22px;
    right: 22px;
    top: 92px;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
    gap: 8px;
    z-index: 3;
  }
  .apple-crate-preview__col {
    position: relative;
    border-left: 4px solid var(--crate-rib);
    border-right: 4px solid var(--crate-rib);
    border-radius: 4px;
  }
  .apple-crate-preview__col::before,
  .apple-crate-preview__col::after {
    content: '';
    position: absolute;
    left: -4px;
    right: -4px;
    height: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__col::before { top: 72px; }
  .apple-crate-preview__col::after { bottom: 68px; }
  .apple-crate-preview__mesh {
    position: absolute;
    left: 6px;
    right: 6px;
    top: 48px;
    bottom: 18px;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 8px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 8px);
    opacity: 0.55;
  }
  .apple-crate-preview__vline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__vline--1 { left: 33%; }
  .apple-crate-preview__vline--2 { left: 66%; }
  .apple-crate-preview__center-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 94px;
    width: 78px;
    height: 128px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    z-index: 4;
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.16);
  }
  .apple-crate-preview__bottom-row {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    height: 54px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    z-index: 4;
  }
  .apple-crate-preview__bottom-cell {
    position: relative;
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    overflow: hidden;
  }
  .apple-crate-preview__bottom-cell::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 7px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 7px);
    opacity: 0.65;
  }
  .apple-crate-preview__side-frame {
    position: absolute;
    top: 64px;
    bottom: 14px;
    width: 18px;
    border-radius: 8px;
    background: linear-gradient(to right, var(--crate-side-frame-a), var(--crate-side-frame-b), var(--crate-side-frame-a));
    z-index: 4;
  }
  .apple-crate-preview__side-frame--left { left: 8px; }
  .apple-crate-preview__side-frame--right { right: 8px; }
  .apple-crate-preview__corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 5px solid var(--crate-rib);
    border-top: none;
    border-left: none;
    border-radius: 0 0 10px 0;
    opacity: 0.65;
    z-index: 4;
  }
  .apple-crate-preview__corner--1 {
    left: 8px;
    bottom: 8px;
    transform: scaleX(-1);
  }
  .apple-crate-preview__corner--2 {
    right: 8px;
    bottom: 8px;
  }
  @keyframes crateIdlePacked {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(0); }
  }
</style>
</head>
<body>
  <div class="scene" style="transform: translate(-41px, 0px);">
    <div class="shadow"></div>
    <div class="apple-crate-preview apple-crate-preview--yellow">
      <div class="apple-crate-preview__model">
        <div class="apple-crate-preview__top-cap"></div>
        <div class="apple-crate-preview__inner-top"></div>
        <div class="apple-crate-preview__load" style="transform: translate(0px, 181px); z-index: -33; opacity: 0.8;">
          <div class="apple-crate-preview__apple apple-crate-preview__apple--a" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--b" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--c" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--d"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--e" style="z-index: 0; transform: translate(6px, 23px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--f" style="transform: translate(6px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--g" style="transform: translate(6px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--h"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--i"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--k" style="z-index: 0; transform: translate(6px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--l" style="z-index: 0; transform: translate(0px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--m" style="z-index: 0; transform: translate(-17px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--n" style="transform: translate(-431px, 0px); z-index: 1;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--o" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--p" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--q" style="z-index: 0;"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.76; transform: translate(0px, -390px) translate(0px, -12px) translate(0px, -87px) translate(0px, 70px); z-index: -3;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 28px) scale(1.14, 1.24);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.88; transform: translate(0px, -390px) translate(0px, 6px) translate(0px, 6px) translate(0px, 47px) scale(1.01, 1.29); z-index: -2;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 66px) scale(1.08, 1.64);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.92; transform: translate(0px, -332px) translate(0px, 6px) translate(0px, 70px) scale(1, 0.79) translate(0px, -29px); z-index: -4;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 110px) scale(1.18, 2.02);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.7; transform: translate(0px, -268px) translate(0px, -12px) translate(0px, -47px) translate(0px, 18px) scale(0.96, 1.08); z-index: -3;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 42px) scale(1.02, 1.32);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.84; transform: translate(0px, 6px) translate(0px, 6px) translate(0px, 41px) scale(0.94, 0.55) translate(0px, 86px) scale(1.04, 1.18); z-index: -10;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 92px) scale(1.12, 1.78);"></div>
        </div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--1" style="z-index: 0; transform: translate(-29px, 0px);"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--2" style="z-index: 0; transform: translate(-17px, 0px);"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--3" style="z-index: 0;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--4" style="z-index: 0; transform: translate(23px, 0px);"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--5" style="z-index: 0; transform: translate(35px, 0px);"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--1"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--2"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--3"></div>
        <div class="apple-crate-preview__grid-area">
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col"></div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh"></div>
          </div>
        </div>
        <div class="apple-crate-preview__center-panel"></div>
        <div class="apple-crate-preview__bottom-row">
          <div class="apple-crate-preview__bottom-cell" style="transform: translate(0px, 0px);"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
        </div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--left"></div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--right"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--1"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--2"></div>
      </div>
    </div>
  </div>

</body></html>`;

export const ANIMATION_LAB_APPLE_CRATE_TWO_THIRDS_HTML = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>노란 컨테이너 사과 적재</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 246, 218, 0.92), transparent 32%),
      linear-gradient(180deg, #f4ead3 0%, #e4d0ab 54%, #caa06c 100%);
    overflow: hidden;
  }
  .scene {
    position: relative;
    width: 620px;
    height: 520px;
  }
  .shadow {
    position: absolute;
    left: 94px;
    right: 94px;
    bottom: 28px;
    height: 42px;
    border-radius: 50%;
    background: rgba(76, 45, 19, 0.22);
    filter: blur(14px);
  }
  .apple-crate-preview {
    position: absolute;
    left: 50%;
    bottom: 48px;
    width: 470px;
    height: 350px;
    transform: translateX(-50%);
    overflow: visible;
    --crate-scale: 1;
    --crate-bg-top: #ffad1f;
    --crate-bg-mid: #ff9500;
    --crate-bg-bot: #f27c00;
    --crate-rib: rgba(230, 110, 0, 0.95);
    --crate-mesh: rgba(255, 188, 80, 0.9);
    --crate-inner-top: #ff9c10;
    --crate-inner-bottom: #ff9300;
    --crate-top-cap: rgba(255, 190, 80, 0.95);
    --crate-top-hole: rgba(255, 255, 255, 0.95);
    --crate-side-frame-a: #f48a00;
    --crate-side-frame-b: #ffad1f;
    animation: crateIdlePacked 4.8s ease-in-out infinite;
  }
  .apple-crate-preview__model {
    position: absolute;
    left: 0;
    top: 0;
    width: 460px;
    height: 340px;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--crate-bg-top) 0%, var(--crate-bg-mid) 55%, var(--crate-bg-bot) 100%);
    box-shadow:
      inset 0 10px 10px rgba(255,255,255,0.18),
      inset 0 -8px 12px rgba(0,0,0,0.08),
      0 12px 25px rgba(0,0,0,0.18);
    transform-origin: top left;
    transform: scale(var(--crate-scale));
  }
  .apple-crate-preview__top-cap {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    height: 34px;
    border-radius: 10px;
    background: var(--crate-top-cap);
    box-shadow: inset 0 -6px 8px rgba(0,0,0,0.08);
  }
  .apple-crate-preview__inner-top {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 26px;
    height: 62px;
    border-radius: 10px 10px 18px 18px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    box-shadow: inset 0 -8px 8px rgba(0, 0, 0, 0.08);
  }
  .apple-crate-preview__load {
    position: absolute;
    left: 30px;
    right: 30px;
    top: 34px;
    height: 108px;
    overflow: visible;
    border-radius: 12px 12px 22px 22px;
    z-index: 1;
    background:
      linear-gradient(180deg, rgba(255, 184, 74, 0.1) 0%, rgba(145, 54, 8, 0.1) 100%);
    box-shadow:
      inset 0 -16px 18px rgba(128, 48, 8, 0.18),
      inset 0 10px 10px rgba(255, 214, 164, 0.08);
  }
  .apple-crate-preview__load::before {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    bottom: -6px;
    height: 72px;
    border-radius: 40px 40px 14px 14px;
    background:
      radial-gradient(circle at 20px 22px, #ffd4c6 0%, #ff9b7a 24%, #ef643b 48%, #cf351f 72%, #99170f 100%) 0 0 / 44px 44px repeat-x,
      radial-gradient(circle at 22px 24px, rgba(255, 244, 229, 0.58) 0 4px, transparent 5px) 0 0 / 44px 44px repeat-x;
    opacity: 0.98;
  }
  .apple-crate-preview__load::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 18px;
    height: 48px;
    border-radius: 999px;
    background: rgba(120, 34, 8, 0.12);
    filter: blur(8px);
  }
  .apple-crate-preview__inner-fill-clip {
    position: absolute;
    left: 32px;
    right: 32px;
    top: 118px;
    height: 124px;
    overflow: hidden;
    border-radius: 14px 14px 20px 20px;
    z-index: 2;
    pointer-events: none;
  }
  .apple-crate-preview__inner-fill {
    position: absolute;
    inset: 0;
    transform-origin: 50% 100%;
    pointer-events: none;
  }
  .apple-crate-preview__inner-fill::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    height: 86px;
    border-radius: 26px 26px 14px 14px;
    background:
      radial-gradient(circle at 22px 22px, #ffd4c6 0%, #ff9b7a 24%, #ef643b 48%, #cf351f 72%, #99170f 100%) 0 0 / 42px 42px repeat,
      radial-gradient(circle at 18px 16px, rgba(255, 242, 230, 0.35) 0 4px, transparent 5px) 0 0 / 42px 42px repeat;
    opacity: 0.48;
    filter: saturate(0.94) brightness(0.98);
  }
  .apple-crate-preview__inner-fill::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 2px;
    height: 76px;
    border-radius: 999px;
    background: rgba(110, 34, 10, 0.12);
    filter: blur(10px);
  }
  .apple-crate-preview__apple {
    position: absolute;
    width: var(--size);
    height: var(--size);
    left: var(--x);
    top: var(--y);
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 28%, #ffe1d6 0%, #ffab8d 18%, #f86c46 42%, #d54025 68%, #a61e12 100%);
    box-shadow:
      inset -7px -8px 0 rgba(123, 25, 15, 0.16),
      0 10px 14px rgba(126, 38, 12, 0.18);
    transform: translateZ(0);
  }
  .apple-crate-preview__apple::before {
    content: "";
    position: absolute;
    left: calc(50% - 2px);
    top: -7px;
    width: 4px;
    height: 14px;
    border-radius: 999px;
    background: #6e4723;
    transform: rotate(10deg);
  }
  .apple-crate-preview__apple::after {
    content: "";
    position: absolute;
    left: calc(50% + 1px);
    top: -6px;
    width: 14px;
    height: 8px;
    border-radius: 10px 2px 10px 2px;
    background: #6ca33d;
    transform: rotate(-26deg);
  }
  .apple-crate-preview__apple--a { --size: 48px; --x: 6px; --y: 10px; }
  .apple-crate-preview__apple--b { --size: 54px; --x: 44px; --y: 4px; }
  .apple-crate-preview__apple--c { --size: 50px; --x: 88px; --y: 14px; }
  .apple-crate-preview__apple--d { --size: 58px; --x: 128px; --y: 0px; }
  .apple-crate-preview__apple--e { --size: 52px; --x: 178px; --y: 12px; }
  .apple-crate-preview__apple--f { --size: 50px; --x: 220px; --y: 6px; }
  .apple-crate-preview__apple--g { --size: 56px; --x: 260px; --y: 10px; }
  .apple-crate-preview__apple--h { --size: 52px; --x: 308px; --y: 2px; }
  .apple-crate-preview__apple--i { --size: 48px; --x: 352px; --y: 14px; }
  .apple-crate-preview__apple--j { --size: 54px; --x: 388px; --y: 8px; }
  .apple-crate-preview__apple--k { --size: 46px; --x: 28px; --y: 36px; }
  .apple-crate-preview__apple--l { --size: 52px; --x: 76px; --y: 42px; }
  .apple-crate-preview__apple--m { --size: 48px; --x: 132px; --y: 40px; }
  .apple-crate-preview__apple--n { --size: 54px; --x: 182px; --y: 44px; }
  .apple-crate-preview__apple--o { --size: 50px; --x: 236px; --y: 38px; }
  .apple-crate-preview__apple--p { --size: 54px; --x: 290px; --y: 44px; }
  .apple-crate-preview__apple--q { --size: 50px; --x: 344px; --y: 38px; }
  .apple-crate-preview__apple--r { --size: 48px; --x: 386px; --y: 44px; }
  .apple-crate-preview__handle {
    position: absolute;
    top: 36px;
    width: 54px;
    height: 22px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 3px 3px, transparent 2px, var(--crate-top-hole) 2.5px, var(--crate-top-hole) 3.2px, transparent 3.3px);
    background-size: 10px 10px;
    opacity: 0.82;
    z-index: 3;
  }
  .apple-crate-preview__handle--1 { left: 68px; }
  .apple-crate-preview__handle--2 { left: 130px; }
  .apple-crate-preview__handle--3 { left: 202px; width: 74px; }
  .apple-crate-preview__handle--4 { right: 130px; }
  .apple-crate-preview__handle--5 { right: 68px; }
  .apple-crate-preview__bar {
    position: absolute;
    left: 18px;
    right: 18px;
    height: 6px;
    background: var(--crate-rib);
    border-radius: 4px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
    z-index: 4;
  }
  .apple-crate-preview__bar--1 { top: 96px; }
  .apple-crate-preview__bar--2 { top: 110px; }
  .apple-crate-preview__bar--3 { top: 124px; }
  .apple-crate-preview__grid-area {
    position: absolute;
    left: 22px;
    right: 22px;
    top: 92px;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
    gap: 8px;
    z-index: 3;
  }
  .apple-crate-preview__col {
    position: relative;
    border-left: 4px solid var(--crate-rib);
    border-right: 4px solid var(--crate-rib);
    border-radius: 4px;
  }
  .apple-crate-preview__col::before,
  .apple-crate-preview__col::after {
    content: '';
    position: absolute;
    left: -4px;
    right: -4px;
    height: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__col::before { top: 72px; }
  .apple-crate-preview__col::after { bottom: 68px; }
  .apple-crate-preview__mesh {
    position: absolute;
    left: 6px;
    right: 6px;
    top: 48px;
    bottom: 18px;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 8px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 8px);
    opacity: 0.55;
  }
  .apple-crate-preview__vline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--crate-rib);
  }
  .apple-crate-preview__vline--1 { left: 33%; }
  .apple-crate-preview__vline--2 { left: 66%; }
  .apple-crate-preview__center-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 94px;
    width: 78px;
    height: 128px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    z-index: 4;
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.16);
  }
  .apple-crate-preview__bottom-row {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    height: 54px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    z-index: 4;
  }
  .apple-crate-preview__bottom-cell {
    position: relative;
    border: 4px solid var(--crate-rib);
    border-radius: 4px;
    overflow: hidden;
  }
  .apple-crate-preview__bottom-cell::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 7px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 7px);
    opacity: 0.65;
  }
  .apple-crate-preview__side-frame {
    position: absolute;
    top: 64px;
    bottom: 14px;
    width: 18px;
    border-radius: 8px;
    background: linear-gradient(to right, var(--crate-side-frame-a), var(--crate-side-frame-b), var(--crate-side-frame-a));
    z-index: 4;
  }
  .apple-crate-preview__side-frame--left { left: 8px; }
  .apple-crate-preview__side-frame--right { right: 8px; }
  .apple-crate-preview__corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 5px solid var(--crate-rib);
    border-top: none;
    border-left: none;
    border-radius: 0 0 10px 0;
    opacity: 0.65;
    z-index: 4;
  }
  .apple-crate-preview__corner--1 {
    left: 8px;
    bottom: 8px;
    transform: scaleX(-1);
  }
  .apple-crate-preview__corner--2 {
    right: 8px;
    bottom: 8px;
  }
  @keyframes crateIdlePacked {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(0); }
  }
</style>
</head>
<body>
  <div class="scene" style="transform: translate(-41px, 0px);">
    <div class="shadow"></div>
    <div class="apple-crate-preview apple-crate-preview--yellow">
      <div class="apple-crate-preview__model">
        <div class="apple-crate-preview__top-cap"></div>
        <div class="apple-crate-preview__inner-top"></div>
        <div class="apple-crate-preview__load" style="transform: translate(0px, -76px) translate(0px, 181px); z-index: -33; opacity: 0.8;">
          <div class="apple-crate-preview__apple apple-crate-preview__apple--a" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--b" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--c" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--d"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--e" style="z-index: 0; transform: translate(6px, 23px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--f" style="transform: translate(6px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--g" style="transform: translate(6px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--h"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--i"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--k" style="z-index: 0; transform: translate(6px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--l" style="z-index: 0; transform: translate(0px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--m" style="z-index: 0; transform: translate(-17px, 0px);"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--n" style="transform: translate(-431px, 0px); z-index: 1;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--o" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--p" style="z-index: 0;"></div>
          <div class="apple-crate-preview__apple apple-crate-preview__apple--q" style="z-index: 0;"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.76; transform: translate(0px, 0px) translate(0px, -390px) translate(0px, -12px) translate(0px, -87px) translate(0px, 70px); z-index: -3;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 28px) scale(1.14, 1.24);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.88; transform: translate(0px, 384px) translate(0px, -390px) translate(0px, 6px) translate(0px, 6px) translate(0px, 47px) scale(1.01, 1.29); z-index: -2;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 66px) scale(1.08, 1.64);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.92; transform: translate(0px, 367px) translate(0px, -332px) translate(0px, 6px) translate(0px, 70px) scale(1, 0.79) translate(0px, -29px); z-index: -4;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 110px) scale(1.18, 2.02);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.7; transform: translate(0px, -268px) translate(0px, -12px) translate(0px, -47px) translate(0px, 18px) scale(0.96, 1.08); z-index: -3;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 42px) scale(1.02, 1.32);"></div>
        </div>
        <div class="apple-crate-preview__inner-fill-clip" style="opacity: 0.84; transform: translate(0px, 0px) translate(0px, 6px) translate(0px, 6px) translate(0px, 41px) scale(0.94, 0.55) translate(0px, 86px) scale(1.04, 1.18); z-index: -10;">
          <div class="apple-crate-preview__inner-fill" style="transform: translate(0px, 92px) scale(1.12, 1.78);"></div>
        </div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--1" style="z-index: 0; transform: translate(-29px, 0px); opacity: 0.82;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--2" style="z-index: 0; transform: translate(-17px, 0px); opacity: 0.82;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--3" style="z-index: 0; opacity: 0.82;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--4" style="z-index: 0; transform: translate(23px, 0px); opacity: 0.82;"></div>
        <div class="apple-crate-preview__handle apple-crate-preview__handle--5" style="z-index: 0; transform: translate(35px, 0px); opacity: 0.82;"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--1"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--2"></div>
        <div class="apple-crate-preview__bar apple-crate-preview__bar--3"></div>
        <div class="apple-crate-preview__grid-area">
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh" style="opacity: 0.55;"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh" style="opacity: 0.55;"></div>
          </div>
          <div class="apple-crate-preview__col"></div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh" style="opacity: 0.55;"></div>
          </div>
          <div class="apple-crate-preview__col">
            <div class="apple-crate-preview__vline apple-crate-preview__vline--1"></div>
            <div class="apple-crate-preview__vline apple-crate-preview__vline--2"></div>
            <div class="apple-crate-preview__mesh" style="opacity: 0.55;"></div>
          </div>
        </div>
        <div class="apple-crate-preview__center-panel"></div>
        <div class="apple-crate-preview__bottom-row">
          <div class="apple-crate-preview__bottom-cell" style="transform: translate(0px, 0px);"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
          <div class="apple-crate-preview__bottom-cell"></div>
        </div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--left"></div>
        <div class="apple-crate-preview__side-frame apple-crate-preview__side-frame--right"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--1" style="opacity: 0.65;"></div>
        <div class="apple-crate-preview__corner apple-crate-preview__corner--2" style="opacity: 0.65;"></div>
      </div>
    </div>
  </div>

</body></html>`;

export const ANIMATION_LAB_CURRENT_CAN_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>현재 말통 애니메이션</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 20% 10%, #eef7f2, #d9e9df);
    font-family: sans-serif;
  }
  .wrap {
    display: grid;
    justify-items: center;
    gap: 12px;
  }
  .title {
    font-size: 16px;
    font-weight: 700;
    color: #1d4f3a;
  }
  .fuel-jerrycan {
    position: relative;
    width: 120px;
    height: 146px;
    filter: drop-shadow(0 8px 14px rgba(5, 18, 12, 0.28));
  }
  .fuel-jerrycan__spout {
    position: absolute;
    left: 6px;
    top: 12px;
    width: 34px;
    height: 16px;
    border-radius: 6px;
    transform: rotate(-24deg);
    z-index: 5;
    background: linear-gradient(160deg, #98a8a2 0%, #7a8b85 100%);
    border: 1px solid rgba(28, 52, 41, 0.28);
  }
  .fuel-jerrycan__handle {
    position: absolute;
    left: 26px;
    top: 8px;
    width: 38px;
    height: 20px;
    border-radius: 8px;
    background: linear-gradient(160deg, #97a8a2 0%, #738681 100%);
    z-index: 5;
    border: 1px solid rgba(28, 52, 41, 0.28);
  }
  .fuel-jerrycan__cap {
    position: absolute;
    left: 52px;
    top: 14px;
    width: 20px;
    height: 12px;
    border-radius: 999px;
    background: linear-gradient(160deg, #82948e 0%, #5c6f69 100%);
    z-index: 6;
  }
  .fuel-jerrycan__body {
    position: absolute;
    left: 8px;
    right: 8px;
    top: 24px;
    bottom: 0;
    border-radius: 18px 18px 16px 16px;
    overflow: hidden;
    background: linear-gradient(180deg, #2f8f66 0%, #1d6e4c 100%);
    border: 2px solid rgba(18, 50, 38, 0.45);
  }
  .fuel-kiosk-fill-anim__liquid {
    position: absolute;
    inset: auto 0 0 0;
    height: 100%;
    transform-origin: bottom;
    transform: scaleY(var(--fuel-fill-ratio, 0));
    background: linear-gradient(180deg, rgba(255, 229, 140, 0.65) 0%, #f5c036 36%, #d39411 100%);
    transition: transform 0.15s linear;
  }
  .fuel-kiosk-fill-anim__liquid::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -8%;
    width: 116%;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 244, 198, 0.5);
    animation: wave 1.3s ease-in-out infinite;
  }
  .fuel-jerrycan__panel {
    position: absolute;
    inset: 18% 16%;
    border-radius: 12px;
    border: 2px solid rgba(228, 245, 236, 0.28);
    box-shadow: inset 0 0 0 1px rgba(9, 37, 27, 0.24);
    z-index: 2;
  }
  .fuel-jerrycan__cross {
    position: absolute;
    inset: 22% 20%;
    border-top: 2px solid rgba(221, 243, 231, 0.3);
    transform-origin: center;
    z-index: 2;
  }
  .fuel-jerrycan__cross--a { transform: rotate(32deg); }
  .fuel-jerrycan__cross--b { transform: rotate(-32deg); }
  .meta {
    font-size: 14px;
    font-weight: 700;
    color: #1f563f;
  }
  @keyframes wave {
    0% { transform: translateX(0); }
    50% { transform: translateX(5px); }
    100% { transform: translateX(0); }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="title">현재 말통 애니메이션</div>
    <div class="fuel-jerrycan">
      <div class="fuel-jerrycan__spout"></div>
      <div class="fuel-jerrycan__handle"></div>
      <div class="fuel-jerrycan__cap"></div>
      <div class="fuel-jerrycan__body">
        <div class="fuel-kiosk-fill-anim__liquid" style="--fuel-fill-ratio: 0.72;"></div>
        <div class="fuel-jerrycan__panel"></div>
        <div class="fuel-jerrycan__cross fuel-jerrycan__cross--a"></div>
        <div class="fuel-jerrycan__cross fuel-jerrycan__cross--b"></div>
      </div>
    </div>
    <div class="meta">휘발유 말통 (72%)</div>
  </div>
</body>
</html>`;

const tintAppleCrateHtmlToGreen = (html) => html
  .replace('<title>노란 컨테이너 사과 적재</title>', '<title>초록 컨테이너 사과 적재</title>')
  .replaceAll('--crate-bg-top: #ffad1f;', '--crate-bg-top: #61b25a;')
  .replaceAll('--crate-bg-mid: #ff9500;', '--crate-bg-mid: #469447;')
  .replaceAll('--crate-bg-bot: #f27c00;', '--crate-bg-bot: #307336;')
  .replaceAll('--crate-rib: rgba(230, 110, 0, 0.95);', '--crate-rib: rgba(39, 105, 56, 0.96);')
  .replaceAll('--crate-mesh: rgba(255, 188, 80, 0.9);', '--crate-mesh: rgba(146, 208, 143, 0.82);')
  .replaceAll('--crate-inner-top: #ff9c10;', '--crate-inner-top: #57a852;')
  .replaceAll('--crate-inner-bottom: #ff9300;', '--crate-inner-bottom: #3d8740;')
  .replaceAll('--crate-top-cap: rgba(255, 190, 80, 0.95);', '--crate-top-cap: rgba(128, 199, 111, 0.95);')
  .replaceAll('--crate-side-frame-a: #f48a00;', '--crate-side-frame-a: #2f7636;')
  .replaceAll('--crate-side-frame-b: #ffad1f;', '--crate-side-frame-b: #5cae56;');

export const ANIMATION_LAB_APPLE_CRATE_GREEN_PACKED_HTML = tintAppleCrateHtmlToGreen(ANIMATION_LAB_APPLE_CRATE_PACKED_HTML);

const TRANSPORT_CRATE_PACKED_SRCDOC = escapeHtmlForSrcDocAttr(
  buildTransportCrateSrcDoc(ANIMATION_LAB_APPLE_CRATE_PACKED_HTML),
);

const TRANSPORT_CRATE_GREEN_PACKED_SRCDOC = escapeHtmlForSrcDocAttr(
  buildTransportCrateSrcDoc(ANIMATION_LAB_APPLE_CRATE_GREEN_PACKED_HTML),
);

const TRANSPORT_CRATE_ONE_THIRD_SRCDOC = escapeHtmlForSrcDocAttr(
  buildTransportCrateSrcDoc(ANIMATION_LAB_APPLE_CRATE_ONE_THIRD_HTML),
);

const TRANSPORT_CRATE_TWO_THIRDS_SRCDOC = escapeHtmlForSrcDocAttr(
  buildTransportCrateSrcDoc(ANIMATION_LAB_APPLE_CRATE_TWO_THIRDS_HTML),
);

const normalizeTransportAnimationCards = (animationCardsRaw = [], crateCountRaw = 36) => {
  const safeCrateCount = Math.max(1, Math.floor(Number(crateCountRaw) || 0));
  const normalizedCards = (Array.isArray(animationCardsRaw) ? animationCardsRaw : [])
    .map((card) => {
      const tone = String(card?.tone || '').toLowerCase() === 'green' ? 'green' : 'yellow';
      const fillStep = Math.max(1, Math.min(3, Math.floor(Number(card?.fillStep) || 3)));
      return { tone, fillStep };
    })
    .filter(Boolean);
  if (normalizedCards.length) return normalizedCards;
  return Array.from({ length: safeCrateCount }, (_, index) => ({
    tone: index % 2 === 1 ? 'green' : 'yellow',
    fillStep: 3
  }));
};

const transportCrateMetaOf = ({
  tone = 'yellow',
  fillStep = 3,
  greenPackedSrcdoc = TRANSPORT_CRATE_GREEN_PACKED_SRCDOC,
  greenOneThirdSrcdoc = '',
  greenTwoThirdsSrcdoc = ''
} = {}) => {
  const isGreen = tone === 'green';
  if (fillStep <= 1) {
    return {
      title: isGreen ? '초록 컨테이너 사과 잔량 1/3' : '노란 컨테이너 사과 잔량 1/3',
      srcdoc: isGreen ? greenOneThirdSrcdoc : TRANSPORT_CRATE_ONE_THIRD_SRCDOC
    };
  }
  if (fillStep === 2) {
    return {
      title: isGreen ? '초록 컨테이너 사과 잔량 2/3' : '노란 컨테이너 사과 잔량 2/3',
      srcdoc: isGreen ? greenTwoThirdsSrcdoc : TRANSPORT_CRATE_TWO_THIRDS_SRCDOC
    };
  }
  return {
    title: isGreen ? '초록 컨테이너 사과 가득참' : '노란 컨테이너 사과 가득참',
    srcdoc: isGreen ? greenPackedSrcdoc : TRANSPORT_CRATE_PACKED_SRCDOC
  };
};

const buildTransportCrateFlowItemsHtml = (
  animationCardsRaw = [],
  crateCountRaw = 36,
  {
    greenPackedSrcdoc = TRANSPORT_CRATE_GREEN_PACKED_SRCDOC,
    greenOneThirdSrcdoc = TRANSPORT_CRATE_GREEN_ONE_THIRD_SRCDOC,
    greenTwoThirdsSrcdoc = TRANSPORT_CRATE_GREEN_TWO_THIRDS_SRCDOC
  } = {}
) => normalizeTransportAnimationCards(animationCardsRaw, crateCountRaw).map((card, index) => {
  const meta = transportCrateMetaOf({
    tone: card?.tone,
    fillStep: card?.fillStep,
    greenPackedSrcdoc,
    greenOneThirdSrcdoc,
    greenTwoThirdsSrcdoc
  });
  return `<div class="transport-crate" style="--crate-index:${index};"><iframe class="transport-crate__frame" title="${meta.title}" srcdoc="${meta.srcdoc}"></iframe></div>`;
}).join('');

export const buildTransportCrateFlowHtml = ({
  crateCount = 36,
  durationMs = 10000,
  passDurationMs = 1900,
  label = '운반중',
  animationCards = [],
  greenOneThirdSrcdoc = TRANSPORT_CRATE_GREEN_ONE_THIRD_SRCDOC,
  greenTwoThirdsSrcdoc = TRANSPORT_CRATE_GREEN_TWO_THIRDS_SRCDOC
} = {}) => {
  const normalizedCards = normalizeTransportAnimationCards(animationCards, crateCount);
  const safeCrateCount = Math.max(1, normalizedCards.length || Math.floor(Number(crateCount) || 1));
  const safeDurationMs = Math.max(1000, Math.floor(Number(durationMs) || 10000));
  const safePassDurationMs = Math.max(700, Math.floor(Number(passDurationMs) || 1900));
  const safeLabel = String(label || '운반중');
  const crateItemsHtml = buildTransportCrateFlowItemsHtml(normalizedCards, safeCrateCount, {
    greenOneThirdSrcdoc,
    greenTwoThirdsSrcdoc
  });
  const crateWidth = safeCrateCount <= 4
    ? 212
    : safeCrateCount <= 9
      ? 166
      : safeCrateCount <= 16
        ? 136
        : safeCrateCount <= 25
          ? 112
          : 96;
  const crateHeight = Math.round(crateWidth * 0.865);
  const frameScale = Math.round(((crateWidth / 620) * 1000)) / 1000;
  const gap = safeCrateCount <= 9 ? 14 : safeCrateCount <= 20 ? 10 : 8;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>운반 컨테이너 흐름 애니메이션</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    overflow: hidden;
    background: transparent;
    font-family: Arial, sans-serif;
    color: #23483a;
  }
  .transport-stage {
    position: relative;
    width: min(1240px, 98vw);
    height: 318px;
    overflow: hidden;
    background: transparent;
  }
  .transport-stage__rail {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 268px;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
  }
  .transport-stage__track {
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: end;
    gap: ${gap}px;
    width: max-content;
    padding-right: 24px;
    animation: transport-crate-pass ${safePassDurationMs}ms linear 1 forwards;
    will-change: transform;
  }
  .transport-stage__gauge {
    position: absolute;
    left: 50%;
    bottom: 4px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: min(560px, calc(100% - 120px));
  }
  .transport-stage__gauge-head {
    display: block;
    font-size: 18px;
    line-height: 1;
    color: #2f5f56;
    text-align: center;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
  }
  .transport-stage__gauge-label {
    font-weight: 900;
    letter-spacing: -0.02em;
  }
  .transport-stage__gauge-value {
    display: none;
  }
  .transport-stage__gauge-track {
    position: relative;
    width: 100%;
    height: 14px;
    border-radius: 999px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(243, 248, 246, 0.98), rgba(208, 223, 218, 0.98));
    border: 1px solid rgba(101, 142, 131, 0.56);
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.75),
      inset 0 -1px 2px rgba(60, 92, 83, 0.14),
      0 4px 10px rgba(62, 104, 91, 0.18);
  }
  .transport-stage__gauge-fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0;
    border-radius: inherit;
    background:
      repeating-linear-gradient(
        -60deg,
        #6ea99a 0 16px,
        #4f897b 16px 28px
      );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.35),
      0 0 14px rgba(79, 137, 123, 0.24);
    animation: transport-gauge-fill ${safeDurationMs}ms linear 1 forwards;
  }
  .transport-stage__gauge-fill::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, transparent 0%, rgba(56, 112, 96, 0.68) 90%, rgba(210, 240, 227, 0.96) 100%);
  }
  .transport-crate {
    position: relative;
    width: ${crateWidth}px;
    min-width: ${crateWidth}px;
    height: ${crateHeight}px;
    overflow: hidden;
    animation: transport-crate-bob 620ms ease-in-out infinite;
  }
  .transport-crate:first-child {
    margin-left: calc(100vw + 80px);
  }
  .transport-crate::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 8px;
    width: ${Math.max(62, Math.round(crateWidth * 0.72))}px;
    height: ${Math.max(10, Math.round(crateHeight * 0.08))}px;
    transform: translateX(-50%);
    border-radius: 999px;
    background: radial-gradient(circle at center, rgba(66, 53, 28, 0.24) 0%, rgba(66, 53, 28, 0.16) 48%, rgba(66, 53, 28, 0) 100%);
    filter: blur(3px);
    pointer-events: none;
  }
  .transport-crate__frame {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 620px;
    height: 520px;
    border: 0;
    background: transparent;
    display: block;
    transform: scale(${frameScale});
    transform-origin: left bottom;
    pointer-events: none;
  }
  @keyframes transport-crate-pass {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(calc(-100% - 100vw - 120px), 0, 0);
    }
  }
  @keyframes transport-crate-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
  @keyframes transport-gauge-fill {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
</style>
</head>
<body>
  <div class="transport-stage">
    <div class="transport-stage__rail">
      <div class="transport-stage__track" aria-label="${safeLabel} 이동 상자">
        ${crateItemsHtml}
      </div>
    </div>
    <div class="transport-stage__gauge" aria-label="운반중 게이지">
      <div class="transport-stage__gauge-head">
        <span class="transport-stage__gauge-label">${safeLabel}</span>
        <span class="transport-stage__gauge-value">100%</span>
      </div>
      <div class="transport-stage__gauge-track">
        <div class="transport-stage__gauge-fill"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const ANIMATION_LAB_APPLE_CRATE_GREEN_ONE_THIRD_HTML = tintAppleCrateHtmlToGreen(ANIMATION_LAB_APPLE_CRATE_ONE_THIRD_HTML);

export const ANIMATION_LAB_APPLE_CRATE_GREEN_TWO_THIRDS_HTML = tintAppleCrateHtmlToGreen(ANIMATION_LAB_APPLE_CRATE_TWO_THIRDS_HTML);

const TRANSPORT_CRATE_GREEN_ONE_THIRD_SRCDOC = escapeHtmlForSrcDocAttr(
  buildTransportCrateSrcDoc(ANIMATION_LAB_APPLE_CRATE_GREEN_ONE_THIRD_HTML),
);

const TRANSPORT_CRATE_GREEN_TWO_THIRDS_SRCDOC = escapeHtmlForSrcDocAttr(
  buildTransportCrateSrcDoc(ANIMATION_LAB_APPLE_CRATE_GREEN_TWO_THIRDS_HTML),
);

export const ANIMATION_LAB_TRANSPORT_CRATE_FLOW_HTML = buildTransportCrateFlowHtml({
  greenOneThirdSrcdoc: TRANSPORT_CRATE_GREEN_ONE_THIRD_SRCDOC,
  greenTwoThirdsSrcdoc: TRANSPORT_CRATE_GREEN_TWO_THIRDS_SRCDOC
});


const tintFruitCrateHtmlToGreen = (html) => html
  .replace('<title>과일 상자 사과 낙하 + 채움</title>', '<title>초록 과일 상자 사과 낙하 + 채움</title>')
  .replaceAll('color: #8f4500;', 'color: #2f6531;')
  .replaceAll('background: linear-gradient(to bottom, rgba(255,247,235,.94), rgba(255,210,149,.76));', 'background: linear-gradient(to bottom, rgba(244, 255, 240, 0.94), rgba(176, 221, 162, 0.8));')
  .replaceAll('border: 1px solid rgba(191, 104, 12, 0.28);', 'border: 1px solid rgba(54, 116, 58, 0.3);')
  .replaceAll('box-shadow: inset 0 2px 4px rgba(0,0,0,.12), 0 2px 6px rgba(150, 81, 11, 0.16);', 'box-shadow: inset 0 2px 4px rgba(0,0,0,.12), 0 2px 6px rgba(44, 96, 49, 0.18);')
  .replaceAll('background: linear-gradient(90deg, #ffbe47 0%, #ff971d 55%, #e56d00 100%);', 'background: linear-gradient(90deg, #9ad764 0%, #5bae53 55%, #2f7636 100%);')
  .replaceAll('box-shadow: inset 0 0 0 1px rgba(255,255,255,.22), 0 0 10px rgba(242, 138, 17, 0.38);', 'box-shadow: inset 0 0 0 1px rgba(255,255,255,.22), 0 0 10px rgba(67, 142, 72, 0.34);')
  .replaceAll('background: radial-gradient(ellipse at center, rgba(255,241,204,.96), rgba(255,173,56,0));', 'background: radial-gradient(ellipse at center, rgba(235, 255, 226, 0.96), rgba(112, 196, 94, 0));')
  .replaceAll('background: linear-gradient(to bottom, #ffad1f 0%, #ff9500 55%, #f27c00 100%);', 'background: linear-gradient(to bottom, #61b25a 0%, #469447 55%, #307336 100%);')
  .replaceAll('background: rgba(255, 186, 70, 0.82);', 'background: rgba(131, 202, 116, 0.86);')
  .replaceAll('background: linear-gradient(to bottom, rgba(255,160,16,0.95), rgba(255,147,0,0.88));', 'background: linear-gradient(to bottom, rgba(95, 172, 89, 0.95), rgba(57, 127, 61, 0.9));')
  .replaceAll('background: rgba(232, 110, 0, 0.95);', 'background: rgba(39, 105, 56, 0.96);')
  .replaceAll('inset 0 0 18px 14px rgba(255, 152, 33, 0.18),', 'inset 0 0 18px 14px rgba(102, 177, 95, 0.18),')
  .replaceAll('inset 0 -10px 18px rgba(255, 176, 82, 0.1);', 'inset 0 -10px 18px rgba(160, 219, 147, 0.12);')
  .replaceAll('background: rgba(230,110,0,0.95);', 'background: rgba(39, 105, 56, 0.96);')
  .replaceAll('border-left: 4px solid rgba(230,110,0,0.95);', 'border-left: 4px solid rgba(39, 105, 56, 0.96);')
  .replaceAll('border-right: 4px solid rgba(230,110,0,0.95);', 'border-right: 4px solid rgba(39, 105, 56, 0.96);')
  .replaceAll('background: linear-gradient(to bottom, #ff9d12, #f48700);', 'background: linear-gradient(to bottom, #57a852, #3d8740);')
  .replaceAll('border: 4px solid rgba(230,110,0,0.95);', 'border: 4px solid rgba(39, 105, 56, 0.96);')
  .replaceAll('rgba(255, 188, 80, 0.95)', 'rgba(146, 208, 143, 0.9)')
  .replaceAll('background: linear-gradient(to right, #f48a00, #ffad1f, #f48a00);', 'background: linear-gradient(to right, #2f7636, #5cae56, #2f7636);')
  .replaceAll('border: 5px solid rgba(230,110,0,0.95);', 'border: 5px solid rgba(39, 105, 56, 0.96);')
  .replaceAll('background: linear-gradient(to bottom, rgba(255, 175, 84, 0.26), rgba(255, 175, 84, 0));', 'background: linear-gradient(to bottom, rgba(151, 214, 135, 0.24), rgba(151, 214, 135, 0));');

export const ANIMATION_LAB_FRUIT_CRATE_GREEN_HTML = tintFruitCrateHtmlToGreen(ANIMATION_LAB_FRUIT_CRATE_HTML);

export const ANIMATION_LAB_FRUIT_CRATE_SEQUENCE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>노랑-초록 과일상자 순차 수확</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #f0f0f0;
    overflow: hidden;
  }
  .sequence-scene {
    position: relative;
    width: 560px;
    height: 560px;
    overflow: hidden;
  }
  .sequence-track {
    position: absolute;
    left: 0;
    top: 0;
    width: 1120px;
    height: 100%;
    display: flex;
    animation: slideSequence 10s ease-in-out forwards;
  }
  .station {
    --progress-label: #8f4500;
    --progress-track-top: rgba(255,247,235,.94);
    --progress-track-bottom: rgba(255,210,149,.76);
    --progress-border: rgba(191, 104, 12, 0.28);
    --progress-shadow: rgba(150, 81, 11, 0.16);
    --progress-fill-start: #ffbe47;
    --progress-fill-mid: #ff971d;
    --progress-fill-end: #e56d00;
    --progress-glow-start: rgba(255,241,204,.96);
    --progress-glow-end: rgba(255,173,56,0);
    --crate-top: #ffad1f;
    --crate-mid: #ff9500;
    --crate-bottom: #f27c00;
    --crate-top-cap: rgba(255, 186, 70, 0.82);
    --crate-inner-top: rgba(255,160,16,0.95);
    --crate-inner-bottom: rgba(255,147,0,0.88);
    --crate-bar: rgba(232, 110, 0, 0.95);
    --crate-grid: rgba(230,110,0,0.95);
    --crate-mesh: rgba(255, 188, 80, 0.95);
    --crate-center-top: #ff9d12;
    --crate-center-bottom: #f48700;
    --crate-side-a: #f48a00;
    --crate-side-b: #ffad1f;
    --crate-corner: rgba(230,110,0,0.95);
    --fill-clip-glow-a: rgba(255, 152, 33, 0.18);
    --fill-clip-glow-b: rgba(255, 176, 82, 0.1);
    --top-sheen-a: rgba(255, 175, 84, 0.26);
    --top-sheen-b: rgba(255, 175, 84, 0);
    position: relative;
    width: 560px;
    height: 100%;
    flex: 0 0 560px;
  }
  .station--green {
    --progress-label: #2f6531;
    --progress-track-top: rgba(244, 255, 240, 0.94);
    --progress-track-bottom: rgba(176, 221, 162, 0.8);
    --progress-border: rgba(54, 116, 58, 0.3);
    --progress-shadow: rgba(44, 96, 49, 0.18);
    --progress-fill-start: #9ad764;
    --progress-fill-mid: #5bae53;
    --progress-fill-end: #2f7636;
    --progress-glow-start: rgba(235, 255, 226, 0.96);
    --progress-glow-end: rgba(112, 196, 94, 0);
    --crate-top: #61b25a;
    --crate-mid: #469447;
    --crate-bottom: #307336;
    --crate-top-cap: rgba(131, 202, 116, 0.86);
    --crate-inner-top: rgba(95, 172, 89, 0.95);
    --crate-inner-bottom: rgba(57, 127, 61, 0.9);
    --crate-bar: rgba(39, 105, 56, 0.96);
    --crate-grid: rgba(39, 105, 56, 0.96);
    --crate-mesh: rgba(146, 208, 143, 0.9);
    --crate-center-top: #57a852;
    --crate-center-bottom: #3d8740;
    --crate-side-a: #2f7636;
    --crate-side-b: #5cae56;
    --crate-corner: rgba(39, 105, 56, 0.96);
    --fill-clip-glow-a: rgba(102, 177, 95, 0.18);
    --fill-clip-glow-b: rgba(160, 219, 147, 0.12);
    --top-sheen-a: rgba(151, 214, 135, 0.24);
    --top-sheen-b: rgba(151, 214, 135, 0);
  }
  .harvest-progress {
    position: absolute;
    left: 50%;
    bottom: 8px;
    width: min(348px, 84vw);
    display: grid;
    gap: 6px;
    transform: translateX(-50%);
  }
  .harvest-progress__label {
    color: var(--progress-label);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .25px;
    text-align: center;
  }
  .harvest-progress__track {
    position: relative;
    height: 14px;
    border-radius: 999px;
    overflow: hidden;
    background: linear-gradient(to bottom, var(--progress-track-top), var(--progress-track-bottom));
    border: 1px solid var(--progress-border);
    box-shadow: inset 0 2px 4px rgba(0,0,0,.12), 0 2px 6px var(--progress-shadow);
  }
  .harvest-progress__track::before {
    content: "";
    position: absolute;
    left: 6px;
    right: 6px;
    top: 3px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(255,255,255,.46), rgba(255,240,219,.12));
    pointer-events: none;
  }
  .harvest-progress__fill {
    position: relative;
    height: 100%;
    width: 0%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--progress-fill-start) 0%, var(--progress-fill-mid) 55%, var(--progress-fill-end) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.22), 0 0 10px color-mix(in srgb, var(--progress-fill-mid) 42%, transparent);
    animation: harvestGaugeFill 5s linear forwards;
  }
  .station--green .harvest-progress__fill {
    animation-delay: 5s;
  }
  .harvest-progress__fill::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      120deg,
      rgba(255,255,255,.32) 0 10px,
      rgba(255,255,255,0) 10px 20px
    );
    animation: harvestGaugeStripe .85s linear infinite;
    mix-blend-mode: screen;
    pointer-events: none;
  }
  .harvest-progress__fill::after {
    content: "";
    position: absolute;
    top: -2px;
    bottom: -2px;
    right: -8px;
    width: 16px;
    border-radius: 999px;
    background: radial-gradient(ellipse at center, var(--progress-glow-start), var(--progress-glow-end));
    animation: harvestGaugeGlow .9s ease-in-out infinite;
    pointer-events: none;
  }
  .crate {
    position: absolute;
    left: 50%;
    bottom: 78px;
    transform: translateX(-50%);
    width: 460px;
    height: 340px;
    border-radius: 18px;
    background: linear-gradient(to bottom, var(--crate-top) 0%, var(--crate-mid) 55%, var(--crate-bottom) 100%);
    box-shadow:
      inset 0 8px 8px rgba(255,255,255,0.12),
      inset 0 -8px 12px rgba(0,0,0,0.08),
      0 12px 25px rgba(0,0,0,0.12);
    overflow: visible;
  }
  .apple-crate-preview__top-cap {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    height: 28px;
    border-radius: 10px;
    background: var(--crate-top-cap);
    box-shadow: inset 0 -3px 5px rgba(0,0,0,0.06);
    z-index: 5;
    transform: scale(0.96, 1);
    transform-origin: center center;
  }
  .inner-top {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 26px;
    height: 42px;
    border-radius: 10px 10px 12px 12px;
    background: linear-gradient(to bottom, var(--crate-inner-top), var(--crate-inner-bottom));
    box-shadow: inset 0 -4px 5px rgba(0,0,0,0.05);
    z-index: 4;
  }
  .handle {
    position: absolute;
    top: 36px;
    width: 54px;
    height: 22px;
    border-radius: 6px;
    background:
      radial-gradient(circle at 3px 3px, transparent 2px, rgba(255,255,255,0.95) 2.5px, rgba(255,255,255,0.95) 3.2px, transparent 3.3px);
    background-size: 10px 10px;
    opacity: 0.75;
    z-index: 31;
  }
  .handle.h1 { left: 68px; }
  .handle.h2 { left: 130px; }
  .handle.h3 { left: 202px; width: 74px; }
  .handle.h4 { right: 130px; }
  .handle.h5 { right: 68px; }
  .bar {
    position: absolute;
    left: 18px;
    right: 18px;
    height: 6px;
    background: var(--crate-bar);
    border-radius: 4px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
    z-index: 32;
  }
  .bar.b1 {
    top: 96px;
    transform: translateY(-29px);
    z-index: 21;
  }
  .bar.b2 {
    top: 110px;
    transform: translateY(-32px);
    z-index: 20;
  }
  .bar.b3 {
    top: 124px;
    transform: translateY(-35px);
    z-index: 20;
  }
  .fill-clip {
    position: absolute;
    left: 26px;
    right: 26px;
    top: 92px;
    bottom: 18px;
    border-radius: 30px 30px 14px 14px / 22px 22px 10px 10px;
    overflow: hidden;
    z-index: 7;
  }
  .fill-clip::after {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: inherit;
    box-shadow:
      inset 0 0 18px 14px var(--fill-clip-glow-a),
      inset 0 -10px 18px var(--fill-clip-glow-b);
    filter: blur(7px);
    opacity: 0.9;
    pointer-events: none;
    z-index: 3;
  }
  .inside-fill {
    position: absolute;
    left: 2px;
    right: 2px;
    bottom: -10px;
    height: 252px;
    overflow: hidden;
    animation: fillInside 5s ease-in-out forwards;
    border-radius: 30px 30px 14px 14px / 22px 22px 10px 10px;
    box-shadow:
      inset 0 18px 28px rgba(0,0,0,0.22),
      inset 0 -8px 12px rgba(255,255,255,0.08);
  }
  .station--green .inside-fill {
    animation-delay: 5s;
  }
  .inside-fill-base {
    position: absolute;
    inset: 0;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") -6px -2px / 72px 72px repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") 40px 20px / 67px 67px repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") 12px 50px / 64px 64px repeat,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.45)'/%3E%3C/svg%3E") 54px 58px / 60px 60px repeat,
      linear-gradient(to bottom, rgba(124, 28, 18, 0.16), rgba(124, 28, 18, 0.16));
    opacity: 0.92;
    filter: brightness(0.72) saturate(0.8) blur(1.1px);
    transform: translateY(8px);
  }
  .inside-fill-top {
    position: absolute;
    left: -18px;
    right: -18px;
    top: -34px;
    height: 74px;
    transform: translateY(41px);
    border-radius: 999px;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.35)'/%3E%3C/svg%3E") -4px -8px / 60px 60px repeat-x,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.35)'/%3E%3C/svg%3E") 34px 14px / 56px 56px repeat-x,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3CradialGradient id='a' cx='32%25' cy='28%25' r='72%25'%3E%3Cstop offset='0%25' stop-color='%23ffc7bc'/%3E%3Cstop offset='31%25' stop-color='%23f9704c'/%3E%3Cstop offset='66%25' stop-color='%23de311f'/%3E%3Cstop offset='100%25' stop-color='%2399170f'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='20' cy='23' rx='13.5' ry='12.5' fill='url(%23a)'/%3E%3Crect x='18.4' y='5' width='3.2' height='8.2' rx='1.6' fill='%236a4728' transform='rotate(7 20 9)'/%3E%3Cellipse cx='26.5' cy='10.5' rx='5.4' ry='3.1' fill='%23529f3d' transform='rotate(-25 26.5 10.5)'/%3E%3Cellipse cx='15.2' cy='17.1' rx='4.6' ry='3.1' fill='rgba(255,205,194,0.35)'/%3E%3C/svg%3E") 14px 28px / 52px 52px repeat-x,
      linear-gradient(to bottom, rgba(255, 181, 152, 0.12), rgba(176, 34, 21, 0.84) 66%, rgba(115, 17, 11, 0.9));
    box-shadow:
      inset 0 5px 8px rgba(255,255,255,0.08),
      0 8px 12px rgba(92, 16, 10, 0.16);
    opacity: 0.9;
    filter: brightness(0.68) saturate(0.78) blur(0.9px);
  }
  .inside-fill-top::after {
    content: "";
    position: absolute;
    left: -8px;
    right: -8px;
    top: -10px;
    height: 28px;
    border-radius: 999px;
    background: linear-gradient(to bottom, var(--top-sheen-a), var(--top-sheen-b));
    filter: blur(10px);
    opacity: 0.95;
    pointer-events: none;
  }
  .falling-apples {
    position: absolute;
    left: 50%;
    top: -320px;
    width: 400px;
    height: 520px;
    transform: translateX(-50%);
    z-index: 6;
    pointer-events: none;
  }
  .falling-apple {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: radial-gradient(circle at 32% 28%, #ffc7bc 0%, #f9704c 31%, #de311f 66%, #99170f 100%);
    box-shadow: inset -4px -5px 0 rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.18);
    opacity: 0;
  }
  .falling-apple::before {
    content: "";
    position: absolute;
    top: -7px;
    left: 22px;
    width: 4px;
    height: 12px;
    background: #6a4728;
    border-radius: 2px;
    transform: rotate(7deg);
  }
  .falling-apple::after {
    content: "";
    position: absolute;
    top: -6px;
    left: 25px;
    width: 13px;
    height: 8px;
    background: #529f3d;
    border-radius: 10px 2px 10px 2px;
    transform: rotate(-25deg);
  }
  .f1 { left: 8px; animation: fastFall1 0.9s linear 0.18s 5 forwards; }
  .f2 { left: 62px; animation: fastFall2 0.8s linear 0.04s 5 forwards; }
  .f3 { left: 118px; animation: fastFall3 0.95s linear 0.29s 5 forwards; }
  .f4 { left: 174px; animation: fastFall4 0.85s linear 0.11s 5 forwards; }
  .f5 { left: 230px; animation: fastFall5 0.78s linear 0.24s 5 forwards; }
  .f6 { left: 286px; animation: fastFall6 0.92s linear 0s 5 forwards; }
  .f7 { left: 342px; animation: fastFall7 0.82s linear 0.21s 5 forwards; }
  .station--green .f1 { animation-delay: 5.18s; }
  .station--green .f2 { animation-delay: 5.04s; }
  .station--green .f3 { animation-delay: 5.29s; }
  .station--green .f4 { animation-delay: 5.11s; }
  .station--green .f5 { animation-delay: 5.24s; }
  .station--green .f6 { animation-delay: 5s; }
  .station--green .f7 { animation-delay: 5.21s; }
  .grid-area {
    position: absolute;
    left: 22px;
    right: 22px;
    top: 92px;
    bottom: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
    gap: 8px;
    z-index: 10;
  }
  .col {
    position: relative;
    border-left: 4px solid var(--crate-grid);
    border-right: 4px solid var(--crate-grid);
    border-radius: 4px;
  }
  .col::before,
  .col::after {
    content: "";
    position: absolute;
    left: -4px;
    right: -4px;
    height: 4px;
    background: var(--crate-grid);
  }
  .col::before { top: 72px; }
  .col::after  { bottom: 68px; }
  .mesh {
    position: absolute;
    left: 6px;
    right: 6px;
    top: 6px;
    bottom: 18px;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 8px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 8px);
    opacity: 0.72;
  }
  .vline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--crate-grid);
  }
  .v1 { left: 33%; }
  .v2 { left: 66%; }
  .center-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 94px;
    width: 78px;
    height: 128px;
    background: linear-gradient(to bottom, var(--crate-center-top), var(--crate-center-bottom));
    border: 4px solid var(--crate-grid);
    border-radius: 4px;
    z-index: 20;
    box-shadow: inset 0 2px 5px rgba(255,255,255,0.16);
  }
  .bottom-row {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 18px;
    height: 54px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    z-index: 21;
  }
  .bottom-cell {
    position: relative;
    border: 4px solid var(--crate-grid);
    border-radius: 4px;
    overflow: hidden;
  }
  .bottom-cell::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(45deg, var(--crate-mesh) 0 2px, transparent 2px 7px),
      repeating-linear-gradient(-45deg, var(--crate-mesh) 0 2px, transparent 2px 7px);
    opacity: 0.65;
  }
  .side-frame {
    position: absolute;
    top: 64px;
    bottom: 14px;
    width: 18px;
    border-radius: 8px;
    background: linear-gradient(to right, var(--crate-side-a), var(--crate-side-b), var(--crate-side-a));
    z-index: 22;
  }
  .side-frame.left { left: 8px; }
  .side-frame.right { right: 8px; }
  .corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 5px solid var(--crate-corner);
    border-top: none;
    border-left: none;
    border-radius: 0 0 10px 0;
    opacity: 0.65;
    z-index: 22;
  }
  .corner.c1 {
    left: 8px;
    bottom: 8px;
    transform: scaleX(-1);
  }
  .corner.c2 {
    right: 8px;
    bottom: 8px;
  }
  @keyframes slideSequence {
    0%, 46% { transform: translateX(0); }
    53%, 100% { transform: translateX(-560px); }
  }
  @keyframes fillInside {
    0%   { transform: translateY(252px); }
    15%  { transform: translateY(228px); }
    35%  { transform: translateY(164px); }
    55%  { transform: translateY(108px); }
    75%  { transform: translateY(56px); }
    100% { transform: translateY(0); }
  }
  @keyframes fastFall1 {
    0%   { transform: translateY(0) rotate(-10deg); opacity: 0; }
    5%   { opacity: 1; }
    66%  { transform: translateY(566px) rotate(8deg); opacity: 1; }
    82%  { opacity: 0; }
    100% { transform: translateY(566px) rotate(8deg); opacity: 0; }
  }
  @keyframes fastFall2 {
    0%   { transform: translateY(-25px) rotate(9deg); opacity: 0; }
    6%   { opacity: 1; }
    67%  { transform: translateY(584px) rotate(-6deg); opacity: 1; }
    83%  { opacity: 0; }
    100% { transform: translateY(584px) rotate(-6deg); opacity: 0; }
  }
  @keyframes fastFall3 {
    0%   { transform: translateY(-10px) rotate(-12deg); opacity: 0; }
    6%   { opacity: 1; }
    66%  { transform: translateY(574px) rotate(6deg); opacity: 1; }
    83%  { opacity: 0; }
    100% { transform: translateY(574px) rotate(6deg); opacity: 0; }
  }
  @keyframes fastFall4 {
    0%   { transform: translateY(-30px) rotate(10deg); opacity: 0; }
    5%   { opacity: 1; }
    68%  { transform: translateY(592px) rotate(-5deg); opacity: 1; }
    84%  { opacity: 0; }
    100% { transform: translateY(592px) rotate(-5deg); opacity: 0; }
  }
  @keyframes fastFall5 {
    0%   { transform: translateY(-18px) rotate(-8deg); opacity: 0; }
    5%   { opacity: 1; }
    66%  { transform: translateY(572px) rotate(7deg); opacity: 1; }
    82%  { opacity: 0; }
    100% { transform: translateY(572px) rotate(7deg); opacity: 0; }
  }
  @keyframes fastFall6 {
    0%   { transform: translateY(-35px) rotate(11deg); opacity: 0; }
    6%   { opacity: 1; }
    68%  { transform: translateY(590px) rotate(-7deg); opacity: 1; }
    84%  { opacity: 0; }
    100% { transform: translateY(590px) rotate(-7deg); opacity: 0; }
  }
  @keyframes fastFall7 {
    0%   { transform: translateY(-15px) rotate(-9deg); opacity: 0; }
    5%   { opacity: 1; }
    67%  { transform: translateY(578px) rotate(5deg); opacity: 1; }
    83%  { opacity: 0; }
    100% { transform: translateY(578px) rotate(5deg); opacity: 0; }
  }
  @keyframes harvestGaugeFill { from { width: 0%; } to { width: 100%; } }
  @keyframes harvestGaugeStripe { from { transform: translateX(0); } to { transform: translateX(20px); } }
  @keyframes harvestGaugeGlow { 0%,100% { opacity: .48; } 50% { opacity: .9; } }
</style>
</head>
<body>
  <div class="sequence-scene">
    <div class="sequence-track">
      <div class="station station--yellow">
        <div class="harvest-progress" aria-hidden="true">
          <div class="harvest-progress__label">노란 상자 수확중</div>
          <div class="harvest-progress__track">
            <div class="harvest-progress__fill"></div>
          </div>
        </div>
        <div class="crate">
          <div class="apple-crate-preview__top-cap"></div>
          <div class="inner-top"></div>
          <div class="fill-clip">
            <div class="inside-fill">
              <div class="inside-fill-base"></div>
              <div class="inside-fill-top"></div>
            </div>
          </div>
          <div class="falling-apples">
            <div class="falling-apple f1"></div>
            <div class="falling-apple f2"></div>
            <div class="falling-apple f3"></div>
            <div class="falling-apple f4"></div>
            <div class="falling-apple f5"></div>
            <div class="falling-apple f6"></div>
            <div class="falling-apple f7"></div>
          </div>
          <div class="handle h1"></div>
          <div class="handle h2"></div>
          <div class="handle h3"></div>
          <div class="handle h4"></div>
          <div class="handle h5"></div>
          <div class="bar b1"></div>
          <div class="bar b2"></div>
          <div class="bar b3"></div>
          <div class="grid-area">
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
            <div class="col"></div>
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
          </div>
          <div class="center-panel"></div>
          <div class="bottom-row">
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
          </div>
          <div class="side-frame left"></div>
          <div class="side-frame right"></div>
          <div class="corner c1"></div>
          <div class="corner c2"></div>
        </div>
      </div>
      <div class="station station--green">
        <div class="harvest-progress" aria-hidden="true">
          <div class="harvest-progress__label">초록 상자 수확중</div>
          <div class="harvest-progress__track">
            <div class="harvest-progress__fill"></div>
          </div>
        </div>
        <div class="crate">
          <div class="apple-crate-preview__top-cap"></div>
          <div class="inner-top"></div>
          <div class="fill-clip">
            <div class="inside-fill">
              <div class="inside-fill-base"></div>
              <div class="inside-fill-top"></div>
            </div>
          </div>
          <div class="falling-apples">
            <div class="falling-apple f1"></div>
            <div class="falling-apple f2"></div>
            <div class="falling-apple f3"></div>
            <div class="falling-apple f4"></div>
            <div class="falling-apple f5"></div>
            <div class="falling-apple f6"></div>
            <div class="falling-apple f7"></div>
          </div>
          <div class="handle h1"></div>
          <div class="handle h2"></div>
          <div class="handle h3"></div>
          <div class="handle h4"></div>
          <div class="handle h5"></div>
          <div class="bar b1"></div>
          <div class="bar b2"></div>
          <div class="bar b3"></div>
          <div class="grid-area">
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
            <div class="col"></div>
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
            <div class="col"><div class="vline v1"></div><div class="vline v2"></div><div class="mesh"></div></div>
          </div>
          <div class="center-panel"></div>
          <div class="bottom-row">
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
            <div class="bottom-cell"></div>
          </div>
          <div class="side-frame left"></div>
          <div class="side-frame right"></div>
          <div class="corner c1"></div>
          <div class="corner c2"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_GROUNDWATER_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>지하수 용량 표시</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(to top, #b8d8a8 0%, #d8f0c8 35%, #87c9ff 100%);
      font-family: Arial, sans-serif;
    }
    .scene {
      width: 420px;
      height: 520px;
      position: relative;
    }
    .ground-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 110px;
      background: linear-gradient(to bottom, #6cbf5f 0%, #59a94f 100%);
      border-radius: 20px 20px 0 0;
      overflow: hidden;
      z-index: 3;
    }
    .grass {
      position: absolute;
      bottom: 0;
      width: 14px;
      height: 28px;
      background: #2f8f3c;
      clip-path: polygon(50% 0%, 100% 100%, 70% 100%, 50% 35%, 30% 100%, 0 100%);
    }
    .tree {
      position: absolute;
      bottom: 18px;
      width: 44px;
      height: 70px;
    }
    .tree .trunk {
      position: absolute;
      bottom: 0;
      left: 17px;
      width: 10px;
      height: 28px;
      background: #7a4b28;
      border-radius: 4px;
    }
    .tree .leaf {
      position: absolute;
      left: 0;
      top: 0;
      width: 44px;
      height: 44px;
      background: #3fa34d;
      border-radius: 50%;
      box-shadow:
        -10px 8px 0 0 #4db55c,
        10px 8px 0 0 #2f9441;
    }
    .soil {
      position: absolute;
      top: 90px;
      left: 0;
      width: 100%;
      height: 410px;
      background: linear-gradient(to bottom, #9a6a43 0%, #7b4e2f 45%, #5e3921 100%);
      border-radius: 0 0 24px 24px;
      overflow: hidden;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
    }
    .soil::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 2px, transparent 3px),
        radial-gradient(circle at 60% 40%, rgba(0,0,0,0.12) 2px, transparent 3px),
        radial-gradient(circle at 35% 75%, rgba(255,255,255,0.05) 2px, transparent 3px),
        radial-gradient(circle at 80% 70%, rgba(0,0,0,0.1) 2px, transparent 3px);
      background-size: 90px 90px;
      opacity: 0.8;
    }
    .water-zone {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: var(--water-level, 45%);
      background: linear-gradient(to top, rgba(49, 176, 255, 0.85), rgba(114, 216, 255, 0.65));
      overflow: hidden;
      transition: height 0.8s ease;
      z-index: 3;
    }
    .wave {
      position: absolute;
      top: -18px;
      width: 200%;
      height: 42px;
      opacity: 0.9;
      background: rgba(255,255,255,0.35);
      border-radius: 40%;
      animation: waveMove 7s linear infinite;
      filter: blur(1px);
    }
    .wave.wave2 {
      top: -12px;
      opacity: 0.45;
      height: 48px;
      animation: waveMove 10s linear infinite reverse;
    }
    @keyframes waveMove {
      from { transform: translateX(0); }
      to { transform: translateX(-25%); }
    }
    .bubble {
      position: absolute;
      bottom: -20px;
      width: 8px;
      height: 8px;
      background: rgba(255,255,255,0.45);
      border-radius: 50%;
      animation: rise 4s infinite ease-in;
    }
    @keyframes rise {
      0% {
        transform: translateY(0) scale(0.8);
        opacity: 0;
      }
      20% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(-180px) scale(1.2);
        opacity: 0;
      }
    }
    .label-box {
      position: absolute;
      top: 22px;
      right: 20px;
      z-index: 5;
      background: rgba(255,255,255,0.92);
      padding: 12px 16px;
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
      text-align: center;
      min-width: 110px;
    }
    .label-box .title {
      font-size: 14px;
      color: #444;
      margin-bottom: 4px;
    }
    .label-box .value {
      font-size: 28px;
      font-weight: bold;
      color: #1c80c9;
      line-height: 1;
    }
    .controller {
      position: absolute;
      left: 20px;
      top: 20px;
      z-index: 5;
      width: 180px;
      background: rgba(255,255,255,0.92);
      padding: 12px;
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }
    .controller label {
      display: block;
      font-size: 14px;
      margin-bottom: 8px;
      color: #333;
    }
    .controller input[type="range"] {
      width: 100%;
    }
    .controller .small {
      margin-top: 6px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="scene">
    <div class="controller">
      <label for="waterRange">지하수 용량 조절</label>
      <input type="range" id="waterRange" min="0" max="100" value="45" />
      <div class="small">값을 움직이면 수위가 변한다</div>
    </div>
    <div class="label-box">
      <div class="title">지하수 용량</div>
      <div class="value" id="waterPercent">45%</div>
    </div>
    <div class="ground-top">
      <div class="tree" style="left: 55px;">
        <div class="leaf"></div>
        <div class="trunk"></div>
      </div>
      <div class="tree" style="left: 310px; transform: scale(0.9);">
        <div class="leaf"></div>
        <div class="trunk"></div>
      </div>
      <div class="grass" style="left: 18px;"></div>
      <div class="grass" style="left: 95px;"></div>
      <div class="grass" style="left: 135px;"></div>
      <div class="grass" style="left: 220px;"></div>
      <div class="grass" style="left: 275px;"></div>
      <div class="grass" style="left: 365px;"></div>
    </div>
    <div class="soil">
      <div class="water-zone" id="waterZone">
        <div class="wave"></div>
        <div class="wave wave2"></div>
        <div class="bubble" style="left: 12%; animation-delay: 0s;"></div>
        <div class="bubble" style="left: 28%; animation-delay: 1s;"></div>
        <div class="bubble" style="left: 44%; animation-delay: 2s;"></div>
        <div class="bubble" style="left: 62%; animation-delay: 0.5s;"></div>
        <div class="bubble" style="left: 80%; animation-delay: 1.7s;"></div>
      </div>
    </div>
  </div>
  <script>
    const waterRange = document.getElementById("waterRange");
    const waterZone = document.getElementById("waterZone");
    const waterPercent = document.getElementById("waterPercent");
    function updateWaterLevel(value) {
      waterZone.style.setProperty("--water-level", value + "%");
      waterPercent.textContent = value + "%";
    }
    waterRange.addEventListener("input", (e) => {
      updateWaterLevel(e.target.value);
    });
    updateWaterLevel(waterRange.value);
  </script>
</body>
</html>`;

export const ANIMATION_LAB_SS_MIX_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>교반중 애니메이션</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #eef4ff 0%, #dbe9ff 100%); font-family: Arial, sans-serif; }
    .scene { display: flex; flex-direction: column; align-items: center; gap: 22px; }
    .label { font-size: 28px; font-weight: 700; color: #1f2a44; letter-spacing: 1px; animation: blink 1.4s ease-in-out infinite; }
    .tank-wrap { position: relative; width: 280px; height: 340px; display: flex; align-items: center; justify-content: center; }
    .motor { position: absolute; top: 0; width: 120px; height: 38px; background: #5f6d7a; border-radius: 12px; box-shadow: inset 0 -4px 0 rgba(0,0,0,0.15); }
    .shaft { position: absolute; top: 32px; width: 10px; height: 120px; background: linear-gradient(180deg, #8a96a3, #5f6873); border-radius: 10px; z-index: 3; }
    .tank { position: absolute; bottom: 0; width: 240px; height: 250px; border: 6px solid rgba(70, 90, 120, 0.45); border-top: 10px solid rgba(70, 90, 120, 0.55); border-radius: 28px 28px 40px 40px; background: rgba(255,255,255,0.22); backdrop-filter: blur(2px); overflow: hidden; box-shadow: 0 18px 30px rgba(25, 45, 80, 0.14); }
    .liquid { position: absolute; left: -6px; right: -6px; bottom: -6px; height: calc(68% + 6px); background: __MIX_BASE__; overflow: hidden; transform-origin: 50% 100%; animation: waterSlosh 1.25s ease-in-out infinite; isolation: isolate; }
    .liquid::before,
    .liquid::after { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; }
    .liquid::before { background: __MIX_MID__; opacity: 0; animation: tintInMid 1.6s ease-out forwards; }
    .liquid::after { background: __MIX_END__; opacity: 0; animation: tintInEnd 2.9s cubic-bezier(.22,.61,.36,1) forwards; }
    .liquid > * { position: relative; z-index: 1; }
    .wave { position: absolute; left: -10%; width: 120%; height: 58px; border-radius: 45%; background: rgba(255,255,255,0.28); animation: waveMove 1.5s ease-in-out infinite; }
    .wave.one { top: -24px; opacity: .95; }
    .wave.two { top: -12px; animation-duration: 2.1s; opacity: .56; }
    .wave.three { top: -2px; animation-duration: 1.2s; opacity: .28; filter: blur(0.4px); }
    .swirl { position: absolute; left: 50%; top: 52%; width: 130px; height: 130px; transform: translate(-50%, -50%); border: 6px solid rgba(255,255,255,0.16); border-top-color: rgba(255,255,255,0.65); border-radius: 50%; animation: spin 1s linear infinite; }
    .agitator { position: absolute; top: 138px; width: 110px; height: 110px; z-index: 4; animation: spin .65s linear infinite; }
    .blade { position: absolute; left: 50%; top: 50%; width: 52px; height: 18px; background: linear-gradient(90deg, #e6edf5, #99a7b5); border-radius: 16px; transform-origin: center center; margin-left: -26px; margin-top: -9px; box-shadow: 0 0 8px rgba(255,255,255,0.35); }
    .blade.b1 { transform: rotate(0deg) translateX(28px); }
    .blade.b2 { transform: rotate(90deg) translateX(28px); }
    .blade.b3 { transform: rotate(180deg) translateX(28px); }
    .blade.b4 { transform: rotate(270deg) translateX(28px); }
    .bubble { position: absolute; bottom: 14px; width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.55); animation: bubbleUp linear infinite; }
    .bubble.b1 { left: 18%; animation-duration: 2s; animation-delay: .2s; }
    .bubble.b2 { left: 30%; width: 7px; height: 7px; animation-duration: 2.3s; animation-delay: 1s; }
    .bubble.b3 { left: 49%; width: 12px; height: 12px; animation-duration: 1.8s; animation-delay: .6s; }
    .bubble.b4 { left: 67%; width: 8px; height: 8px; animation-duration: 2.2s; animation-delay: 1.4s; }
    .bubble.b5 { left: 81%; width: 11px; height: 11px; animation-duration: 1.9s; animation-delay: .9s; }
    .status-dots { display: flex; gap: 8px; align-items: center; justify-content: center; }
    .status-dots span { width: 10px; height: 10px; border-radius: 50%; background: #335c9b; animation: pulse 1.2s infinite ease-in-out; }
    .status-dots span:nth-child(2) { animation-delay: .15s; }
    .status-dots span:nth-child(3) { animation-delay: .3s; }
    .mix-progress { width: min(320px, 84vw); display: grid; gap: 6px; }
    .mix-progress__label { color: #284374; font-size: 13px; font-weight: 800; letter-spacing: .25px; text-align: center; }
    .mix-progress__track {
      position: relative;
      height: 14px;
      border-radius: 999px;
      overflow: hidden;
      background: linear-gradient(to bottom, rgba(255,255,255,.9), rgba(177,194,216,.72));
      border: 1px solid rgba(63, 96, 141, 0.28);
      box-shadow: inset 0 2px 4px rgba(0,0,0,.14), 0 2px 6px rgba(28, 62, 103, 0.18);
    }
    .mix-progress__track::before {
      content: "";
      position: absolute;
      left: 6px;
      right: 6px;
      top: 3px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(255,255,255,.52), rgba(255,255,255,.12));
      pointer-events: none;
    }
    .mix-progress__fill {
      position: relative;
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, #60b9ff 0%, #3a92e2 55%, #2c71c5 100%);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.2), 0 0 10px rgba(75, 143, 227, 0.44);
      animation: mixGaugeFill 3s linear forwards;
    }
    .mix-progress__fill::before {
      content: "";
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        120deg,
        rgba(255,255,255,.32) 0 10px,
        rgba(255,255,255,0) 10px 20px
      );
      animation: mixGaugeStripe .85s linear infinite;
      mix-blend-mode: screen;
      pointer-events: none;
    }
    .mix-progress__fill::after {
      content: "";
      position: absolute;
      top: -2px;
      bottom: -2px;
      right: -8px;
      width: 16px;
      border-radius: 999px;
      background: radial-gradient(ellipse at center, rgba(228,245,255,.95), rgba(141,206,255,0));
      animation: mixGaugeGlow .9s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes waveMove { from { transform: translateX(-9%) rotate(-1.8deg) scaleX(1.01); } 50% { transform: translateX(9%) rotate(1.8deg) scaleX(.99); } to { transform: translateX(-9%) rotate(-1.8deg) scaleX(1.01); } }
    @keyframes waterSlosh { 0%,100% { transform: rotate(-.9deg) translateX(-2px); } 50% { transform: rotate(.9deg) translateX(2px); } }
    @keyframes tintInMid { 0% { opacity: 0; } 100% { opacity: .65; } }
    @keyframes tintInEnd { 0% { opacity: 0; } 35% { opacity: 0; } 100% { opacity: .95; } }
    @keyframes bubbleUp { 0% { transform: translateY(0) scale(.8); opacity: 0; } 20% { opacity: .85; } 100% { transform: translateY(-150px) scale(1.2); opacity: 0; } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
    @keyframes pulse { 0%,80%,100% { transform: scale(.8); opacity: .45; } 40% { transform: scale(1.2); opacity: 1; } }
    @keyframes mixGaugeFill { from { width: 0%; } to { width: 100%; } }
    @keyframes mixGaugeStripe { from { transform: translateX(0); } to { transform: translateX(20px); } }
    @keyframes mixGaugeGlow { 0%,100% { opacity: .48; } 50% { opacity: .9; } }
  </style>
</head>
<body>
  <div class="scene">
    <div class="label">교반중</div>
    <div class="tank-wrap">
      <div class="motor"></div>
      <div class="shaft"></div>
      <div class="tank">
        <div class="liquid">
          <div class="wave one"></div>
          <div class="wave two"></div>
          <div class="wave three"></div>
          <div class="swirl"></div>
          <div class="bubble b1"></div><div class="bubble b2"></div><div class="bubble b3"></div><div class="bubble b4"></div><div class="bubble b5"></div>
        </div>
      </div>
      <div class="agitator">
        <div class="blade b1"></div><div class="blade b2"></div><div class="blade b3"></div><div class="blade b4"></div>
      </div>
    </div>
    <div class="status-dots"><span></span><span></span><span></span></div>
    <div class="mix-progress" aria-hidden="true">
      <div class="mix-progress__label">배합중</div>
      <div class="mix-progress__track">
        <div class="mix-progress__fill"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_SPRAY_FAN_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>방제팬 애니메이션</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #e9f8d8;
    }

    .fan-wrap {
      position: relative;
      width: 320px;
      height: 320px;
      --gear-radius: 164px;
    }

    .fan-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 14px solid #555;
      box-shadow:
        inset 0 0 0 6px #8c8c8c,
        0 0 0 2px rgba(0,0,0,0.15);
    }

    .fan-guard {
      position: absolute;
      inset: 22px;
      border-radius: 50%;
      overflow: hidden;
    }

    .fan-guard::before,
    .fan-guard::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      pointer-events: none;
    }

    .fan-guard::before {
      background:
        repeating-linear-gradient(
          90deg,
          rgba(110,110,110,0.35) 0 4px,
          transparent 4px 22px
        );
    }

    .fan-guard::after {
      background:
        repeating-linear-gradient(
          0deg,
          rgba(110,110,110,0.25) 0 4px,
          transparent 4px 22px
        );
      border: 4px solid rgba(120,120,120,0.45);
    }

    .fan-rotor {
      position: absolute;
      inset: 42px;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .blade {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 42px;
      height: 130px;
      margin-left: -21px;
      margin-top: -120px;
      transform-origin: 50% 120px;
      border-radius: 60% 60% 45% 45%;
      background: linear-gradient(
        to bottom,
        #b8b8b8 0%,
        #7a7a7a 40%,
        #565656 100%
      );
      box-shadow:
        inset 6px 0 0 rgba(255,255,255,0.18),
        inset -6px 0 0 rgba(0,0,0,0.15);
      clip-path: polygon(50% 0%, 88% 14%, 100% 100%, 0% 100%, 12% 14%);
    }

    .blade:nth-child(1) { transform: rotate(0deg); }
    .blade:nth-child(2) { transform: rotate(60deg); }
    .blade:nth-child(3) { transform: rotate(120deg); }
    .blade:nth-child(4) { transform: rotate(180deg); }
    .blade:nth-child(5) { transform: rotate(240deg); }
    .blade:nth-child(6) { transform: rotate(300deg); }

    .fan-center {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 74px;
      height: 74px;
      margin-left: -37px;
      margin-top: -37px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #cfcfcf, #6d6d6d 70%);
      border: 6px solid #3f3f3f;
      z-index: 3;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.08) inset;
    }

    .fan-wind {
      position: absolute;
      inset: 56px;
      border-radius: 50%;
      animation: spin 0.35s linear infinite;
      opacity: 0.22;
      filter: blur(2px);
      background:
        conic-gradient(
          from 0deg,
          rgba(255,255,255,0.0) 0deg 20deg,
          rgba(220,220,220,0.55) 20deg 36deg,
          rgba(255,255,255,0.0) 36deg 60deg,
          rgba(220,220,220,0.55) 60deg 76deg,
          rgba(255,255,255,0.0) 76deg 120deg,
          rgba(220,220,220,0.55) 120deg 136deg,
          rgba(255,255,255,0.0) 136deg 180deg,
          rgba(220,220,220,0.55) 180deg 196deg,
          rgba(255,255,255,0.0) 196deg 240deg,
          rgba(220,220,220,0.55) 240deg 256deg,
          rgba(255,255,255,0.0) 256deg 300deg,
          rgba(220,220,220,0.55) 300deg 316deg,
          rgba(255,255,255,0.0) 316deg 360deg
        );
      z-index: 1;
    }

    .fan-gear-teeth {
      position: absolute;
      inset: 0;
      z-index: 7;
      pointer-events: none;
    }

    .spray-streams {
      position: absolute;
      left: 0;
      top: -88px;
      width: 380px;
      height: 180px;
      pointer-events: none;
      z-index: 6;
      overflow: visible;
    }

    .spray-stream {
      fill: none;
      stroke: #67c6ff;
      stroke-width: 2.3;
      stroke-linecap: round;
      stroke-opacity: 0.9;
      filter: drop-shadow(0 0 1px rgba(180, 235, 255, 0.7));
      stroke-dasharray: 8 11;
      animation: sprayFlow 1.1s linear infinite;
    }

    .spray-stream:nth-child(2n) {
      stroke: #7ed0ff;
      stroke-width: 2;
      animation-duration: 1.28s;
      animation-delay: -0.25s;
    }

    .spray-stream:nth-child(3n) {
      stroke: #5dbdff;
      animation-duration: 0.96s;
      animation-delay: -0.4s;
    }

    .gear-tooth {
      position: absolute;
      width: 14px;
      height: 10px;
      border-radius: 3px;
      border: 1.5px solid #4b4b4b;
      background: linear-gradient(to bottom, #9f9f9f 0%, #6f6f6f 100%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.28);
      transform: translate(-50%, -50%) rotate(var(--angle, 0deg));
      transform-origin: 50% 50%;
    }

    .gear-tooth::after {
      content: "";
      position: absolute;
      inset: 2px;
      border-radius: 2px;
      background: rgba(255,255,255,0.18);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="fan-wrap">
    <div class="fan-gear-teeth" id="fanGearTeeth"></div>
    <div class="fan-ring"></div>
    <div class="fan-guard"></div>
    <div class="fan-wind"></div>
    <div class="fan-rotor">
      <div class="blade"></div>
      <div class="blade"></div>
      <div class="blade"></div>
      <div class="blade"></div>
      <div class="blade"></div>
      <div class="blade"></div>
    </div>
    <div class="fan-center"></div>
  </div>
  <script>
    (function () {
      const wrap = document.querySelector(".fan-wrap");
      const teethHost = document.getElementById("fanGearTeeth");
      if (!wrap || !teethHost) return;

      const size = Math.max(1, Math.min(wrap.clientWidth || 0, wrap.clientHeight || 0));
      const center = size / 2;
      const css = window.getComputedStyle(wrap);
      const radius = Number.parseFloat(css.getPropertyValue("--gear-radius")) || (size * 0.5125);
      const startDeg = -72;
      const endDeg = 72;
      const count = 11;
      teethHost.innerHTML = "";

      for (let i = 0; i < count; i += 1) {
        const t = count === 1 ? 0 : i / (count - 1);
        const angle = startDeg + (endDeg - startDeg) * t;
        const rad = angle * (Math.PI / 180);
        const x = center + radius * Math.sin(rad);
        const y = center - radius * Math.cos(rad);

        const tooth = document.createElement("div");
        tooth.className = "gear-tooth";
        tooth.style.left = x + "px";
        tooth.style.top = y + "px";
        tooth.style.setProperty("--angle", angle + "deg");
        teethHost.appendChild(tooth);
      }
    })();
  </script>
</body>
</html>`;

export const ANIMATION_LAB_SPRAY_FAN_HOOD_HTML = `<!DOCTYPE html>
<html lang="ko"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>방제팬 애니메이션 (후드형)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: transparent;
    }

    .machine-wrap {
      position: relative;
      width: 380px;
      height: 390px;
      filter: drop-shadow(0 10px 14px rgba(0,0,0,0.2));
    }

    .machine-wrap::before {
      content: "";
      position: absolute;
      left: 36px;
      right: 36px;
      bottom: 52px;
      height: 34px;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 70%);
      filter: blur(3px);
      z-index: -1;
      pointer-events: none;
    }

    .hood-outline {
      position: absolute;
      left: 24px;
      top: 16px;
      width: 332px;
      height: 292px;
      border: 3px solid #6b6f72;
      border-bottom: 0;
      border-radius: 168px 168px 40px 40px;
      z-index: 0;
      background: linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0));
      overflow: hidden;
      isolation: isolate;
    }

    /* 내부 칠은 별도 레이어로 깔아서 테두리선 뒤에만 보이게 처리 */
    .hood-outline::before {
      content: "";
      position: absolute;
      inset: 3px 3px 0 3px;
      border-radius: 165px 165px 37px 37px;
      background: linear-gradient(
        to bottom,
        #ffadb4 0%,
        #f07e87 44%,
        #d9535e 100%
      );
      box-shadow:
        inset 0 22px 28px rgba(255,255,255,0.33),
        inset 0 -20px 24px rgba(97, 27, 33, 0.24),
        inset 18px 0 16px rgba(255,255,255,0.08),
        inset -18px 0 16px rgba(0,0,0,0.07);
      z-index: -1;
      pointer-events: none;
    }

    .hood-outline::after {
      content: "";
      position: absolute;
      left: 20px;
      right: 20px;
      top: 22px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.32), rgba(255,255,255,0));
      opacity: 0.55;
      pointer-events: none;
    }

    .base-beam {
      position: absolute;
      left: 92px;
      right: 92px;
      bottom: 32px;
      height: 16px;
      border: 3px solid #66696c;
      border-radius: 10px;
      background: linear-gradient(to bottom, #d9dbde 0%, #b5b8bb 52%, #9ea1a5 100%);
      box-shadow:
        inset 0 2px 2px rgba(255,255,255,0.42),
        inset 0 -2px 2px rgba(0,0,0,0.25);
      z-index: 1;
    }

    .wheel {
      position: absolute;
      width: 56px;
      height: 104px;
      bottom: 0;
      border: 3px solid #131416;
      border-radius: 9px 9px 14px 14px;
      overflow: hidden;
      background: linear-gradient(to bottom, #3a3d41 0%, #222428 52%, #17191c 100%);
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,0.12),
        inset 0 -2px 2px rgba(0,0,0,0.45);
      z-index: 2;
    }
    .wheel::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background:
        linear-gradient(
          to right,
          rgba(0,0,0,0.34) 0 18%,
          rgba(255,255,255,0.06) 18% 82%,
          rgba(0,0,0,0.34) 82% 100%
        ),
        repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,0.12) 0 3px,
          rgba(0,0,0,0.0) 3px 13px
        ),
        repeating-linear-gradient(
          to bottom,
          rgba(0,0,0,0.3) 0 2px,
          rgba(0,0,0,0.0) 2px 11px
        );
      background-size: 100% 100%, 100% 28px, 100% 28px;
      animation: wheelTreadMove 0.45s linear infinite;
      opacity: 0.96;
    }
    .wheel::after {
      content: "";
      position: absolute;
      inset: -6px -10px;
      border-radius: inherit;
      background:
        repeating-linear-gradient(
          to bottom,
          transparent 0 12px,
          transparent 12px 32px
        ),
        repeating-linear-gradient(
          to bottom,
          transparent 0 12px,
          transparent 12px 32px
        );
      background-image:
        repeating-linear-gradient(
          to bottom,
          transparent 0 2px,
          transparent 2px 30px
        ),
        repeating-linear-gradient(
          to bottom,
          transparent 0 2px,
          transparent 2px 30px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent 0 8px,
          #181a1c 8px 13px,
          #777b81 13px 14px,
          transparent 14px 30px
        ),
        repeating-linear-gradient(
          45deg,
          transparent 0 8px,
          #181a1c 8px 13px,
          #777b81 13px 14px,
          transparent 14px 30px
        );
      background-size: 0 0, 0 0, 22px 34px, 22px 34px;
      background-position: left -6px top 0, right -6px top 0, left -6px top 0, right -6px top 0;
      background-repeat: no-repeat, no-repeat, repeat-y, repeat-y;
      animation: wheelLugMove 0.45s linear infinite;
      pointer-events: none;
    }
    .wheel.left { left: 48px; }
    .wheel.right { right: 48px; }

    .fan-wrap {
      position: absolute;
      left: 40px;
      top: 40px;
      width: 300px;
      height: 300px;
      --gear-radius: 154px;
      z-index: 3;
    }

    .fan-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 14px solid #4f5154;
      box-shadow:
        inset 0 0 0 6px #8e9297,
        inset 0 4px 8px rgba(255,255,255,0.16),
        inset 0 -8px 10px rgba(0,0,0,0.25),
        0 0 0 2px rgba(0,0,0,0.2);
      background: linear-gradient(165deg, #8f9499 0%, #666a70 52%, #54575c 100%);
    }

    .fan-guard {
      position: absolute;
      inset: 22px;
      border-radius: 50%;
      overflow: hidden;
      z-index: 5;
      background: rgba(255,255,255,0.02);
    }

    .fan-guard::before,
    .fan-guard::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      pointer-events: none;
    }

    .fan-guard::before {
      background:
        repeating-linear-gradient(
          90deg,
          rgba(104,108,112,0.4) 0 4px,
          transparent 4px 22px
        );
    }

    .fan-guard::after {
      background:
        repeating-linear-gradient(
          0deg,
          rgba(96,100,104,0.3) 0 4px,
          transparent 4px 22px
        );
      border: 4px solid rgba(116,120,124,0.52);
    }

    .fan-rotor {
      position: absolute;
      inset: 42px;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      z-index: 2;
    }

    .blade {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 42px;
      height: 130px;
      margin-left: -21px;
      margin-top: -120px;
      transform-origin: 50% 120px;
      border-radius: 60% 60% 45% 45%;
      background: linear-gradient(to bottom, #bcc0c4 0%, #83898f 44%, #5e646a 100%);
      box-shadow:
        inset 7px 0 0 rgba(255,255,255,0.22),
        inset -7px 0 0 rgba(0,0,0,0.2),
        0 1px 2px rgba(0,0,0,0.22);
      clip-path: polygon(50% 0%, 88% 14%, 100% 100%, 0% 100%, 12% 14%);
    }
    .blade:nth-child(1) { transform: rotate(0deg); }
    .blade:nth-child(2) { transform: rotate(60deg); }
    .blade:nth-child(3) { transform: rotate(120deg); }
    .blade:nth-child(4) { transform: rotate(180deg); }
    .blade:nth-child(5) { transform: rotate(240deg); }
    .blade:nth-child(6) { transform: rotate(300deg); }

    .fan-center {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 74px;
      height: 74px;
      margin-left: -37px;
      margin-top: -37px;
      border-radius: 50%;
      background: radial-gradient(circle at 34% 34%, #e2e5e8 0%, #a3a8ae 42%, #656a6f 76%);
      border: 6px solid #45494d;
      z-index: 3;
      box-shadow:
        0 0 0 3px rgba(255,255,255,0.1) inset,
        inset 0 -4px 6px rgba(0,0,0,0.3);
    }

    .fan-wind {
      position: absolute;
      inset: 56px;
      border-radius: 50%;
      animation: spin 0.35s linear infinite;
      opacity: 0.16;
      filter: blur(2.6px);
      background: conic-gradient(
        from 0deg,
        rgba(255,255,255,0.0) 0deg 20deg,
        rgba(220,220,220,0.55) 20deg 36deg,
        rgba(255,255,255,0.0) 36deg 60deg,
        rgba(220,220,220,0.55) 60deg 76deg,
        rgba(255,255,255,0.0) 76deg 120deg,
        rgba(220,220,220,0.55) 120deg 136deg,
        rgba(255,255,255,0.0) 136deg 180deg,
        rgba(220,220,220,0.55) 180deg 196deg,
        rgba(255,255,255,0.0) 196deg 240deg,
        rgba(220,220,220,0.55) 240deg 256deg,
        rgba(255,255,255,0.0) 256deg 300deg,
        rgba(220,220,220,0.55) 300deg 316deg,
        rgba(255,255,255,0.0) 316deg 360deg
      );
      z-index: 1;
    }

    .fan-gear-teeth {
      position: absolute;
      inset: 0;
      z-index: 7;
      pointer-events: none;
    }

    .spray-mist {
      position: absolute;
      inset: 0;
      z-index: 12;
      pointer-events: none;
      overflow: visible;
    }

    .nozzle-jet {
      position: absolute;
      width: 126px;
      height: 22px;
      border-radius: 999px;
      background:
        linear-gradient(
          90deg,
          rgba(175, 235, 255, 0.0) 0%,
          rgba(189, 242, 255, 0.62) 20%,
          rgba(166, 224, 255, 0.64) 64%,
          rgba(148, 214, 255, 0.0) 100%
        );
      clip-path: polygon(0 49%, 12% 40%, 72% 32%, 100% 16%, 100% 84%, 72% 68%, 12% 60%);
      filter: blur(1.35px);
      opacity: 0.76;
      transform-origin: 8% 50%;
      animation: nozzleJetPulse 1.45s ease-in-out infinite;
    }

    .nozzle-jet::after {
      content: "";
      position: absolute;
      right: 0;
      top: 1px;
      width: 42%;
      height: 20px;
      border-radius: 999px;
      background: radial-gradient(
        ellipse at 80% 50%,
        rgba(191, 241, 255, 0.82) 0%,
        rgba(165, 223, 255, 0.46) 54%,
        rgba(148, 214, 255, 0.0) 100%
      );
      filter: blur(0.9px);
      pointer-events: none;
    }

    .nozzle-jet::before {
      content: "";
      position: absolute;
      right: -18px;
      top: -10px;
      width: 60px;
      height: 42px;
      border-radius: 999px;
      background:
        radial-gradient(
          ellipse at 22% 50%,
          rgba(208, 246, 255, 0.52) 0%,
          rgba(177, 232, 255, 0.34) 42%,
          rgba(148, 214, 255, 0.0) 100%
        );
      filter: blur(3.2px);
      opacity: 0.72;
      transform-origin: 18% 50%;
      animation: nozzleMistBloom 1.45s ease-in-out infinite;
      animation-delay: inherit;
      pointer-events: none;
    }

    .mist-puff {
      position: absolute;
      width: var(--puff-size, 90px);
      height: calc(var(--puff-size, 90px) * 0.82);
      border-radius: 999px;
      background:
        radial-gradient(
          ellipse at 36% 50%,
          rgba(229, 250, 255, 0.96) 0%,
          rgba(171, 227, 255, 0.76) 48%,
          rgba(104, 187, 255, 0.0) 100%
        );
      filter: blur(8.2px);
      opacity: 1;
      transform: translate(-50%, -50%);
      animation: mistPuffFloat 2.9s ease-in-out infinite;
      animation-delay: var(--puff-delay, 0s);
      pointer-events: none;
    }

    .gear-tooth {
      position: absolute;
      width: 14px;
      height: 10px;
      border-radius: 3px;
      border: 1.5px solid #4b4b4b;
      background: linear-gradient(to bottom, #a8adb2 0%, #73787d 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.32),
        0 1px 1px rgba(0,0,0,0.25);
      transform: translate(-50%, -50%) rotate(var(--angle, 0deg));
      transform-origin: 50% 50%;
    }

    .gear-tooth::after {
      content: "";
      position: absolute;
      inset: 2px;
      border-radius: 2px;
      background: rgba(255,255,255,0.18);
    }

    .spray-progress {
      position: absolute;
      left: 50%;
      bottom: -42px;
      width: 274px;
      transform: translateX(-50%);
      z-index: 20;
      pointer-events: none;
      font-family: "Segoe UI", "Noto Sans KR", sans-serif;
    }

    .spray-progress__label {
      color: rgba(30, 54, 38, 0.94);
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.35px;
      margin-bottom: 6px;
      text-align: center;
      text-shadow: 0 1px 0 rgba(255,255,255,0.52);
    }

    .spray-progress__track {
      position: relative;
      height: 14px;
      border-radius: 999px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(182,196,183,0.72));
      border: 1px solid rgba(95, 110, 96, 0.4);
      overflow: hidden;
      box-shadow:
        inset 0 1px 2px rgba(0,0,0,0.24),
        inset 0 -1px 1px rgba(255,255,255,0.34),
        0 2px 8px rgba(30, 50, 34, 0.18);
      backdrop-filter: blur(1px);
    }

    .spray-progress__track::before {
      content: "";
      position: absolute;
      left: 6px;
      right: 6px;
      top: 1px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.72), rgba(255,255,255,0));
      pointer-events: none;
    }

    .spray-progress__fill {
      position: relative;
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(
        90deg,
        #4ba760 0%,
        #73cc82 42%,
        #97e2a4 100%
      );
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.48),
        inset 0 -1px 1px rgba(32, 102, 46, 0.32),
        0 0 10px rgba(94, 198, 118, 0.46);
      animation: sprayGaugeFill 3s linear infinite;
    }

    .spray-progress__fill::before {
      content: "";
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        120deg,
        rgba(255,255,255,0.2) 0 7px,
        rgba(255,255,255,0.0) 7px 15px
      );
      mix-blend-mode: screen;
      opacity: 0.55;
      animation: sprayGaugeStripe 0.85s linear infinite;
      pointer-events: none;
    }

    .spray-progress__fill::after {
      content: "";
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 30px;
      right: -10px;
      border-radius: 999px;
      background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0) 72%);
      opacity: 0.7;
      animation: sprayGaugeGlow 0.9s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    @keyframes wheelTreadMove {
      from {
        background-position: 0 0, 0 0, 0 0;
      }
      to {
        background-position: 0 0, 0 -24px, 0 -24px;
      }
    }

    @keyframes wheelLugMove {
      from {
        background-position: left -6px top 0, right -6px top 0, left -6px top 0, right -6px top 0;
      }
      to {
        background-position: left -6px top -34px, right -6px top -34px, left -6px top -34px, right -6px top -34px;
      }
    }

    @keyframes nozzleJetPulse {
      0% {
        transform: translateY(0) scale(0.96) rotate(var(--jet-angle, -90deg));
        opacity: 0.55;
      }
      50% {
        transform: translateY(-1px) scale(1.05) rotate(var(--jet-angle, -90deg));
        opacity: 0.86;
      }
      100% {
        transform: translateY(0) scale(0.96) rotate(var(--jet-angle, -90deg));
        opacity: 0.55;
      }
    }

    @keyframes nozzleMistBloom {
      0% {
        transform: scale(0.88);
        opacity: 0.52;
      }
      50% {
        transform: scale(1.08);
        opacity: 0.82;
      }
      100% {
        transform: scale(0.88);
        opacity: 0.52;
      }
    }

    @keyframes mistPuffFloat {
      0% {
        transform: translate(-50%, -50%) scale(0.86);
        opacity: 0.72;
      }
      50% {
        transform: translate(-50%, -59%) scale(1.32);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(0.86);
        opacity: 0.72;
      }
    }

    @keyframes sprayGaugeFill {
      from { width: 0%; }
      to { width: 100%; }
    }

    @keyframes sprayGaugeStripe {
      from { transform: translateX(0); }
      to { transform: translateX(20px); }
    }

    @keyframes sprayGaugeGlow {
      0%, 100% { opacity: 0.45; }
      50% { opacity: 0.88; }
    }
  </style>
</head>
<body>
  <div class="machine-wrap" style="transform: translate(0px, 6px) translate(0px, 26px);">
    <div class="hood-outline" style="transform: translate(0px, -45px);"></div>
    <div class="spray-mist" id="sprayMistHood" aria-hidden="true" style="transform: translate(26px, -6px) scale(0.85, 1);"></div>
    <div class="fan-wrap" style="transform: translate(0px, -52px) scale(0.9);">
      <div class="fan-gear-teeth" id="fanGearTeethHood"></div>
      <div class="fan-ring"></div>
      <div class="fan-guard"></div>
      <div class="fan-wind"></div>
      <div class="fan-rotor">
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
        <div class="blade"></div>
      </div>
      <div class="fan-center"></div>
    </div>
    <div class="wheel left" style="transform: translate(0px, -32px) translate(0px, -26px) scale(1.3, 1); z-index: -3;"></div>
    <div class="wheel right" style="transform: translate(0px, -32px) translate(0px, -26px) scale(1.3, 1); z-index: -3;"></div>
    <div class="base-beam" style="transform: translate(-6px, -77px) scale(1.22, 1.43);"></div>
    <div class="spray-progress" aria-hidden="true">
      <div class="spray-progress__label">살포중</div>
      <div class="spray-progress__track">
        <div class="spray-progress__fill"></div>
      </div>
    </div>
  </div>
  <script>
    (function () {
      const wrap = document.querySelector(".fan-wrap");
      const teethHost = document.getElementById("fanGearTeethHood");
      const mistHost = document.getElementById("sprayMistHood");
      if (!wrap || !teethHost || !mistHost) return;
      const size = Math.max(1, Math.min(wrap.clientWidth || 0, wrap.clientHeight || 0));
      const center = size / 2;
      const css = window.getComputedStyle(wrap);
      const radius = Number.parseFloat(css.getPropertyValue("--gear-radius")) || (size * 0.5125);
      const startDeg = -72;
      const endDeg = 72;
      const count = 11;
      teethHost.innerHTML = "";
      mistHost.innerHTML = "";
      for (let i = 0; i < count; i += 1) {
        const t = count === 1 ? 0 : i / (count - 1);
        const angle = startDeg + (endDeg - startDeg) * t;
        const rad = angle * (Math.PI / 180);
        const x = center + radius * Math.sin(rad);
        const y = center - radius * Math.cos(rad);
        const tooth = document.createElement("div");
        tooth.className = "gear-tooth";
        tooth.style.left = x + "px";
        tooth.style.top = y + "px";
        tooth.style.setProperty("--angle", angle + "deg");
        teethHost.appendChild(tooth);

        const jet = document.createElement("div");
        jet.className = "nozzle-jet";
        const nx = x + (10 * Math.sin(rad));
        const ny = y - (10 * Math.cos(rad));
        jet.style.left = nx + "px";
        jet.style.top = ny + "px";
        jet.style.setProperty("--jet-angle", (angle - 90) + "deg");
        jet.style.animationDelay = (-0.12 * i) + "s";
        mistHost.appendChild(jet);

        const jetRad = (angle - 90) * (Math.PI / 180);
        for (let p = 0; p < 7; p += 1) {
          const dist = 116 + (p * 18);
          const endX = nx + Math.cos(jetRad) * dist;
          const endY = ny + Math.sin(jetRad) * dist;
          const sideSeed = (i + (p * 3)) % 7;
          const sideSign = sideSeed < 3 ? -1 : 1;
          const sideSpread = sideSign * (4 + sideSeed * 4 + p * 2);
          const puff = document.createElement("div");
          puff.className = "mist-puff";
          puff.style.left = (endX + Math.cos(jetRad + (Math.PI / 2)) * sideSpread) + "px";
          puff.style.top = (endY + Math.sin(jetRad + (Math.PI / 2)) * sideSpread - (6 + p * 1.5)) + "px";
          puff.style.setProperty("--puff-size", (82 + p * 9 + (i % 4) * 5) + "px");
          puff.style.setProperty("--puff-delay", (-0.1 * i - 0.08 * p) + "s");
          mistHost.appendChild(puff);

          const corePuff = document.createElement("div");
          corePuff.className = "mist-puff";
          corePuff.style.left = (endX + Math.cos(jetRad + (Math.PI / 2)) * (sideSpread * 0.45)) + "px";
          corePuff.style.top = (endY - 4) + "px";
          corePuff.style.setProperty("--puff-size", (96 + p * 6) + "px");
          corePuff.style.setProperty("--puff-delay", (-0.08 * i - 0.06 * p - 0.2) + "s");
          mistHost.appendChild(corePuff);
        }
      }
    })();
  </script>

</body></html>`;

export const ANIMATION_LAB_CIRCLE_BURST_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>원형 버스트 전환</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
      background: #0f172a;
    }

    .page {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 20px;
    }

    .page1 {
      z-index: 1;
      background:
        radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 35%),
        linear-gradient(135deg, #1d4ed8, #0f172a 70%);
      color: white;
    }

    .page2 {
      z-index: 2;
      background:
        radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 30%),
        linear-gradient(135deg, #111827, #059669 130%);
      color: white;
      clip-path: circle(0px at 50% 50%);
      pointer-events: none;
    }

    .title {
      font-size: clamp(32px, 5vw, 62px);
      font-weight: 800;
      letter-spacing: -0.03em;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    }

    .desc {
      font-size: clamp(14px, 1.6vw, 18px);
      opacity: 0.9;
    }

    .btn {
      border: 0;
      padding: 16px 28px;
      border-radius: 999px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      color: white;
      background: rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease, background 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.2);
    }

    .btn:active {
      transform: translateY(1px) scale(0.98);
    }

    .ring {
      position: absolute;
      width: 22px;
      height: 22px;
      border: 2px solid rgba(255,255,255,0.9);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0.6);
      opacity: 0;
      pointer-events: none;
      z-index: 3;
    }

    .ring.pulse {
      animation: pulseRing 0.28s ease-out forwards;
    }

    @keyframes pulseRing {
      0% {
        opacity: 0.95;
        transform: translate(-50%, -50%) scale(0.6);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.2);
      }
    }

    .hint {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 14px;
      opacity: 0.75;
    }
  </style>
</head>
<body>
  <section class="page page1" id="page1">
    <div class="title">첫 화면</div>
    <div class="desc">살짝 커졌다가 멈칫 후 확 퍼짐</div>
    <button class="btn" id="goBtn">다음 화면으로</button>
    <div class="hint">아무데나 눌러도 테스트됨</div>
  </section>

  <section class="page page2" id="page2">
    <div class="title">다음 화면</div>
    <div class="desc">원형 버스트 전환 완료</div>
    <button class="btn" id="backBtn">돌아가기</button>
  </section>

  <div class="ring" id="ring"></div>

  <script>
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const goBtn = document.getElementById('goBtn');
    const backBtn = document.getElementById('backBtn');
    const ring = document.getElementById('ring');

    let isAnimating = false;

    function getMaxRadius(x, y) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dx = Math.max(x, w - x);
      const dy = Math.max(y, h - y);
      return Math.sqrt(dx * dx + dy * dy);
    }

    function showRing(x, y) {
      ring.style.left = String(x) + 'px';
      ring.style.top = String(y) + 'px';
      ring.classList.remove('pulse');
      void ring.offsetWidth;
      ring.classList.add('pulse');
    }

    function burstToPage2(x, y) {
      if (isAnimating) return;
      isAnimating = true;

      const finalRadius = getMaxRadius(x, y) + 40;
      const smallRadius = 40;

      showRing(x, y);

      page2.style.transition = 'none';
      page2.style.clipPath = 'circle(0px at ' + x + 'px ' + y + 'px)';

      requestAnimationFrame(() => {
        page2.style.transition = 'clip-path 120ms ease-out';
        page2.style.clipPath = 'circle(' + smallRadius + 'px at ' + x + 'px ' + y + 'px)';

        setTimeout(() => {
          page2.style.transition = 'clip-path 700ms cubic-bezier(0.18, 0.02, 0.05, 1.2)';
          page2.style.clipPath = 'circle(' + finalRadius + 'px at ' + x + 'px ' + y + 'px)';
        }, 120);
      });

      setTimeout(() => {
        page2.style.pointerEvents = 'auto';
        isAnimating = false;
      }, 900);
    }

    function burstBackToPage1(x, y) {
      if (isAnimating) return;
      isAnimating = true;

      const finalRadius = getMaxRadius(x, y) + 40;

      page2.style.pointerEvents = 'none';
      page2.style.transition = 'none';
      page2.style.clipPath = 'circle(' + finalRadius + 'px at ' + x + 'px ' + y + 'px)';

      requestAnimationFrame(() => {
        page2.style.transition = 'clip-path 600ms cubic-bezier(0.55, 0.06, 0.68, 0.19)';
        page2.style.clipPath = 'circle(0px at ' + x + 'px ' + y + 'px)';
      });

      setTimeout(() => {
        isAnimating = false;
      }, 650);
    }

    goBtn.addEventListener('click', (e) => {
      burstToPage2(e.clientX, e.clientY);
    });

    backBtn.addEventListener('click', (e) => {
      burstBackToPage1(e.clientX, e.clientY);
    });

    page1.addEventListener('click', (e) => {
      if (e.target === goBtn) return;
      burstToPage2(e.clientX, e.clientY);
    });
  </script>
</body>
</html>`;

export const ANIMATION_LAB_TV_MODAL_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TV 스타일 모달 미리보기</title>
  <style>
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
    }

    body {
      min-height: 100vh;
      background: #0a0a0a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
    }

    @keyframes tvOpen {
      0% {
        transform: scaleX(0.02) scaleY(1);
        opacity: 0;
        filter: brightness(1.8);
      }
      25% {
        opacity: 1;
      }
      65% {
        transform: scaleX(1.06) scaleY(1);
        opacity: 1;
        filter: brightness(1.15);
      }
      100% {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
        filter: brightness(1);
      }
    }

    @keyframes tvClose {
      0% {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
        filter: brightness(1);
      }
      70% {
        transform: scaleX(0.08) scaleY(1);
        opacity: 1;
        filter: brightness(1.4);
      }
      100% {
        transform: scaleX(0.02) scaleY(1);
        opacity: 0;
        filter: brightness(2);
      }
    }

    @keyframes overlayFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes overlayFadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    .preview-shell {
      width: min(900px, 100%);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      padding: 40px 32px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(6px);
      text-align: center;
    }

    .preview-title {
      margin: 0;
      font-size: clamp(24px, 4.2vw, 42px);
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .preview-desc {
      margin-top: 14px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.76);
      line-height: 1.5;
    }

    .preview-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 16px;
      padding: 11px 18px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.14s ease, filter 0.14s ease, background 0.18s ease;
      color: rgba(255, 255, 255, 0.92);
      background: rgba(255, 255, 255, 0.08);
    }

    .btn:hover {
      transform: translateY(-1px);
      filter: brightness(1.08);
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn--primary {
      color: #111111;
      border-color: transparent;
      background: #ffffff;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(2px);
      z-index: 40;
    }

    .modal-overlay.is-mounted {
      display: flex;
    }

    .overlay-open {
      animation: overlayFadeIn 0.18s ease-out forwards;
    }

    .overlay-close {
      animation: overlayFadeOut 0.22s ease-in forwards;
    }

    .tv-modal {
      width: min(520px, 100%);
      border-radius: 24px;
      border: 1px solid rgba(154, 226, 255, 0.24);
      background: #171717;
      padding: 28px;
      box-shadow: 0 0 60px rgba(255, 255, 255, 0.08);
      transform-origin: center center;
    }

    .tv-modal-open {
      animation: tvOpen 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .tv-modal-close {
      animation: tvClose 0.28s cubic-bezier(0.55, 0, 1, 0.45) forwards;
    }

    .scan-line {
      margin-bottom: 14px;
      height: 2px;
      width: 100%;
      background: linear-gradient(to right, transparent, rgba(170, 232, 255, 0.75), transparent);
      opacity: 0.72;
    }

    .tv-modal h2 {
      margin: 0;
      font-size: 29px;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .tv-modal p {
      margin: 12px 0 0;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.65;
      font-size: 14px;
    }

    .modal-panel {
      margin-top: 18px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      padding: 14px;
      text-align: left;
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
      line-height: 1.55;
    }

    .modal-panel ul {
      margin: 8px 0 0;
      padding-left: 17px;
    }

    .modal-actions {
      margin-top: 18px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="preview-shell">
    <h1 class="preview-title">TV 스타일 모달 미리보기</h1>
    <p class="preview-desc">버튼을 누르면 가운데 세로선처럼 나타난 뒤 양옆으로 펼쳐집니다.</p>
    <div class="preview-actions">
      <button id="openBtn" class="btn btn--primary" type="button">모달 열기</button>
      <button id="closeOutsideBtn" class="btn" type="button">바깥에서 닫기 테스트</button>
    </div>
  </div>

  <div id="overlay" class="modal-overlay" role="dialog" aria-modal="true" aria-label="TV 모달">
    <div id="tvModal" class="tv-modal">
      <div class="scan-line"></div>
      <h2>모달이 켜졌습니다</h2>
      <p>처음엔 얇은 세로선처럼 나타나고, 곧바로 양옆으로 확장되면서 TV 전원 켜지는 느낌이 납니다.</p>

      <div class="modal-panel">
        <div>테스트 포인트</div>
        <ul>
          <li>열기 버튼을 누르면 세로선에서 시작해 좌우로 펼쳐짐</li>
          <li>닫기 버튼이나 바깥 배경 클릭 시 한 줄로 줄어들며 닫힘</li>
          <li>순수 HTML 버전이라 애니메이션 실험실에서 바로 실행 가능</li>
        </ul>
      </div>

      <div class="modal-actions">
        <button id="closeBtn" class="btn" type="button">닫기</button>
        <button class="btn btn--primary" type="button">확인</button>
      </div>
    </div>
  </div>

  <script>
    (function () {
      const overlay = document.getElementById('overlay');
      const tvModal = document.getElementById('tvModal');
      const openBtn = document.getElementById('openBtn');
      const closeBtn = document.getElementById('closeBtn');
      const closeOutsideBtn = document.getElementById('closeOutsideBtn');

      let isMounted = false;
      let isVisible = false;

      function syncClasses() {
        overlay.classList.toggle('is-mounted', isMounted);
        overlay.classList.remove('overlay-open', 'overlay-close');
        tvModal.classList.remove('tv-modal-open', 'tv-modal-close');

        if (!isMounted) return;

        if (isVisible) {
          overlay.classList.add('overlay-open');
          tvModal.classList.add('tv-modal-open');
        } else {
          overlay.classList.add('overlay-close');
          tvModal.classList.add('tv-modal-close');
        }
      }

      function openModal() {
        isMounted = true;
        isVisible = true;
        syncClasses();
      }

      function closeModal() {
        if (!isMounted) return;
        isVisible = false;
        syncClasses();
      }

      tvModal.addEventListener('animationend', () => {
        if (!isVisible) {
          isMounted = false;
          syncClasses();
        }
      });

      openBtn.addEventListener('click', openModal);
      closeOutsideBtn.addEventListener('click', closeModal);
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);
      tvModal.addEventListener('click', (event) => {
        event.stopPropagation();
      });
    })();
  </script>
</body>
</html>`;

export const ANIMATION_LAB_TV_MODAL_LIGHT_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TV 스타일 모달 미리보기 (밝은 버전)</title>
  <style>
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
    }

    body {
      min-height: 100vh;
      background: linear-gradient(160deg, #f7fbff 0%, #eaf4ff 48%, #f3fff6 100%);
      color: #102235;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
    }

    @keyframes tvOpen {
      0% {
        transform: scaleX(0.02) scaleY(1);
        opacity: 0;
        filter: brightness(1.15);
      }
      25% {
        opacity: 1;
      }
      65% {
        transform: scaleX(1.06) scaleY(1);
        opacity: 1;
        filter: brightness(1.06);
      }
      100% {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
        filter: brightness(1);
      }
    }

    @keyframes tvClose {
      0% {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
      }
      70% {
        transform: scaleX(0.08) scaleY(1);
        opacity: 1;
      }
      100% {
        transform: scaleX(0.02) scaleY(1);
        opacity: 0;
      }
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes overlayFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .preview-shell {
      width: min(900px, 100%);
      border-radius: 24px;
      border: 1px solid rgba(122, 164, 207, 0.34);
      background: rgba(255, 255, 255, 0.84);
      padding: 40px 32px;
      box-shadow: 0 22px 44px rgba(63, 95, 127, 0.16);
      backdrop-filter: blur(4px);
      text-align: center;
    }

    .preview-title {
      margin: 0;
      font-size: clamp(24px, 4.2vw, 42px);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #17344f;
    }

    .preview-desc {
      margin-top: 14px;
      font-size: 14px;
      color: rgba(28, 58, 86, 0.78);
      line-height: 1.5;
    }

    .preview-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      border: 1px solid rgba(83, 123, 162, 0.28);
      border-radius: 16px;
      padding: 11px 18px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.14s ease, filter 0.14s ease, background 0.18s ease;
      color: #1d3c59;
      background: rgba(255, 255, 255, 0.9);
    }

    .btn:hover {
      transform: translateY(-1px);
      filter: brightness(1.03);
      background: #ffffff;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn--primary {
      color: #ffffff;
      border-color: transparent;
      background: linear-gradient(135deg, #5fb5ff, #4f8efc);
    }

    .btn--primary:hover {
      background: linear-gradient(135deg, #6dc0ff, #5d99ff);
      color: #ffffff;
      filter: brightness(1.04);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(144, 170, 196, 0.42);
      backdrop-filter: blur(2px);
      z-index: 40;
    }

    .modal-overlay.is-mounted {
      display: flex;
    }

    .overlay-open { animation: overlayFadeIn 0.18s ease-out forwards; }
    .overlay-close { animation: overlayFadeOut 0.22s ease-in forwards; }

    .tv-modal {
      width: min(520px, 100%);
      border-radius: 24px;
      border: 1px solid rgba(104, 164, 219, 0.35);
      background: linear-gradient(180deg, #ffffff 0%, #f4fbff 100%);
      padding: 28px;
      box-shadow: 0 0 60px rgba(89, 143, 196, 0.2);
      transform-origin: center center;
      color: #17334d;
    }

    .tv-modal-open { animation: tvOpen 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .tv-modal-close { animation: tvClose 0.28s cubic-bezier(0.55, 0, 1, 0.45) forwards; }

    .scan-line {
      margin-bottom: 14px;
      height: 2px;
      width: 100%;
      background: linear-gradient(to right, transparent, rgba(84, 170, 245, 0.72), transparent);
      opacity: 0.78;
    }

    .tv-modal h2 {
      margin: 0;
      font-size: 29px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #1d3f5f;
    }

    .tv-modal p {
      margin: 12px 0 0;
      color: rgba(34, 67, 98, 0.78);
      line-height: 1.65;
      font-size: 14px;
    }

    .modal-panel {
      margin-top: 18px;
      border-radius: 16px;
      border: 1px solid rgba(95, 150, 201, 0.25);
      background: rgba(233, 247, 255, 0.72);
      padding: 14px;
      text-align: left;
      color: rgba(35, 70, 101, 0.86);
      font-size: 13px;
      line-height: 1.55;
    }

    .modal-panel ul {
      margin: 8px 0 0;
      padding-left: 17px;
    }

    .modal-actions {
      margin-top: 18px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="preview-shell">
    <h1 class="preview-title">TV 스타일 모달 미리보기</h1>
    <p class="preview-desc">밝은 톤 버전입니다. 버튼을 누르면 가운데 세로선처럼 나타난 뒤 양옆으로 펼쳐집니다.</p>
    <div class="preview-actions">
      <button id="openBtn" class="btn btn--primary" type="button">모달 열기</button>
      <button id="closeOutsideBtn" class="btn" type="button">바깥에서 닫기 테스트</button>
    </div>
  </div>

  <div id="overlay" class="modal-overlay" role="dialog" aria-modal="true" aria-label="TV 모달 라이트">
    <div id="tvModal" class="tv-modal">
      <div class="scan-line"></div>
      <h2>모달이 켜졌습니다</h2>
      <p>밝은 UI 톤에서도 TV 켜짐 느낌으로, 세로선에서 좌우 확장 전환이 재생됩니다.</p>

      <div class="modal-panel">
        <div>테스트 포인트</div>
        <ul>
          <li>열기 버튼 누르면 세로선 시작 후 좌우로 확장</li>
          <li>닫기 버튼/배경 클릭 시 한 줄로 줄어들며 닫힘</li>
          <li>밝은 배경에서도 텍스트 대비 유지</li>
        </ul>
      </div>

      <div class="modal-actions">
        <button id="closeBtn" class="btn" type="button">닫기</button>
        <button class="btn btn--primary" type="button">확인</button>
      </div>
    </div>
  </div>

  <script>
    (function () {
      const overlay = document.getElementById('overlay');
      const tvModal = document.getElementById('tvModal');
      const openBtn = document.getElementById('openBtn');
      const closeBtn = document.getElementById('closeBtn');
      const closeOutsideBtn = document.getElementById('closeOutsideBtn');

      let isMounted = false;
      let isVisible = false;

      function syncClasses() {
        overlay.classList.toggle('is-mounted', isMounted);
        overlay.classList.remove('overlay-open', 'overlay-close');
        tvModal.classList.remove('tv-modal-open', 'tv-modal-close');
        if (!isMounted) return;
        if (isVisible) {
          overlay.classList.add('overlay-open');
          tvModal.classList.add('tv-modal-open');
        } else {
          overlay.classList.add('overlay-close');
          tvModal.classList.add('tv-modal-close');
        }
      }

      function openModal() {
        isMounted = true;
        isVisible = true;
        syncClasses();
      }

      function closeModal() {
        if (!isMounted) return;
        isVisible = false;
        syncClasses();
      }

      tvModal.addEventListener('animationend', () => {
        if (!isVisible) {
          isMounted = false;
          syncClasses();
        }
      });

      openBtn.addEventListener('click', openModal);
      closeOutsideBtn.addEventListener('click', closeModal);
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);
      tvModal.addEventListener('click', (event) => event.stopPropagation());
    })();
  </script>
</body>
</html>`;

export const ANIMATION_LAB_TV_MODAL_GAME_TONE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TV 스타일 모달 미리보기 (게임 톤)</title>
  <style>
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
    }

    body {
      min-height: 100vh;
      background: linear-gradient(160deg, #f3eee3 0%, #efe6d3 48%, #e6f0e8 100%);
      color: #173d2d;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: hidden;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
    }

    @keyframes tvOpen {
      0% {
        transform: scaleX(0.02) scaleY(1);
        opacity: 0;
        filter: brightness(1.12);
      }
      25% {
        opacity: 1;
      }
      65% {
        transform: scaleX(1.06) scaleY(1);
        opacity: 1;
        filter: brightness(1.04);
      }
      100% {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
        filter: brightness(1);
      }
    }

    @keyframes tvClose {
      0% {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
      }
      70% {
        transform: scaleX(0.08) scaleY(1);
        opacity: 1;
      }
      100% {
        transform: scaleX(0.02) scaleY(1);
        opacity: 0;
      }
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes overlayFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .preview-shell {
      width: min(900px, 100%);
      border-radius: 24px;
      border: 1px solid rgba(59, 98, 73, 0.22);
      background: rgba(255, 250, 241, 0.88);
      padding: 40px 32px;
      box-shadow: 0 20px 38px rgba(84, 73, 46, 0.16);
      backdrop-filter: blur(3px);
      text-align: center;
    }

    .preview-title {
      margin: 0;
      font-size: clamp(24px, 4.2vw, 42px);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #1f4e3a;
    }

    .preview-desc {
      margin-top: 14px;
      font-size: 14px;
      color: rgba(31, 78, 58, 0.78);
      line-height: 1.5;
    }

    .preview-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      border: 1px solid rgba(61, 97, 74, 0.24);
      border-radius: 16px;
      padding: 11px 18px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.14s ease, filter 0.14s ease, background 0.18s ease;
      color: #234f3d;
      background: rgba(251, 247, 235, 0.95);
    }

    .btn:hover {
      transform: translateY(-1px);
      filter: brightness(1.03);
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn--primary {
      color: #f8fff9;
      border-color: transparent;
      background: linear-gradient(135deg, #3d7d5e, #295d46);
    }

    .btn--primary:hover {
      color: #f8fff9;
      background: linear-gradient(135deg, #4a8f6d, #336b52);
      filter: brightness(1.04);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(33, 53, 41, 0.34);
      backdrop-filter: blur(2px);
      z-index: 40;
    }

    .modal-overlay.is-mounted {
      display: flex;
    }

    .overlay-open { animation: overlayFadeIn 0.18s ease-out forwards; }
    .overlay-close { animation: overlayFadeOut 0.22s ease-in forwards; }

    .tv-modal {
      width: min(520px, 100%);
      border-radius: 24px;
      border: 1px solid rgba(63, 106, 79, 0.28);
      background: linear-gradient(180deg, #fff9ed 0%, #f6efdf 100%);
      padding: 28px;
      box-shadow: 0 0 52px rgba(78, 69, 42, 0.2);
      transform-origin: center center;
      color: #204835;
    }

    .tv-modal-open { animation: tvOpen 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .tv-modal-close { animation: tvClose 0.28s cubic-bezier(0.55, 0, 1, 0.45) forwards; }

    .scan-line {
      margin-bottom: 14px;
      height: 2px;
      width: 100%;
      background: linear-gradient(to right, transparent, rgba(89, 141, 106, 0.72), transparent);
      opacity: 0.8;
    }

    .tv-modal h2 {
      margin: 0;
      font-size: 29px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #1f4e3a;
    }

    .tv-modal p {
      margin: 12px 0 0;
      color: rgba(35, 73, 55, 0.78);
      line-height: 1.65;
      font-size: 14px;
    }

    .modal-panel {
      margin-top: 18px;
      border-radius: 16px;
      border: 1px solid rgba(92, 136, 106, 0.24);
      background: rgba(234, 243, 227, 0.72);
      padding: 14px;
      text-align: left;
      color: rgba(35, 73, 55, 0.86);
      font-size: 13px;
      line-height: 1.55;
    }

    .modal-panel ul {
      margin: 8px 0 0;
      padding-left: 17px;
    }

    .modal-actions {
      margin-top: 18px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="preview-shell">
    <h1 class="preview-title">TV 스타일 모달 미리보기</h1>
    <p class="preview-desc">게임 UI 톤 버전입니다. 버튼을 누르면 가운데 세로선처럼 나타난 뒤 양옆으로 펼쳐집니다.</p>
    <div class="preview-actions">
      <button id="openBtn" class="btn btn--primary" type="button">모달 열기</button>
      <button id="closeOutsideBtn" class="btn" type="button">바깥에서 닫기 테스트</button>
    </div>
  </div>

  <div id="overlay" class="modal-overlay" role="dialog" aria-modal="true" aria-label="TV 모달 게임 톤">
    <div id="tvModal" class="tv-modal">
      <div class="scan-line"></div>
      <h2>모달이 켜졌습니다</h2>
      <p>기존 농장 시뮬레이터 톤에 맞춰, 세로선 시작 후 좌우 확장 전환이 재생됩니다.</p>

      <div class="modal-panel">
        <div>테스트 포인트</div>
        <ul>
          <li>열기 버튼 누르면 세로선 시작 후 좌우로 확장</li>
          <li>닫기 버튼/배경 클릭 시 한 줄로 줄어들며 닫힘</li>
          <li>게임 UI의 베이지/그린 계열 색상 적용</li>
        </ul>
      </div>

      <div class="modal-actions">
        <button id="closeBtn" class="btn" type="button">닫기</button>
        <button class="btn btn--primary" type="button">확인</button>
      </div>
    </div>
  </div>

  <script>
    (function () {
      const overlay = document.getElementById('overlay');
      const tvModal = document.getElementById('tvModal');
      const openBtn = document.getElementById('openBtn');
      const closeBtn = document.getElementById('closeBtn');
      const closeOutsideBtn = document.getElementById('closeOutsideBtn');

      let isMounted = false;
      let isVisible = false;

      function syncClasses() {
        overlay.classList.toggle('is-mounted', isMounted);
        overlay.classList.remove('overlay-open', 'overlay-close');
        tvModal.classList.remove('tv-modal-open', 'tv-modal-close');
        if (!isMounted) return;
        if (isVisible) {
          overlay.classList.add('overlay-open');
          tvModal.classList.add('tv-modal-open');
        } else {
          overlay.classList.add('overlay-close');
          tvModal.classList.add('tv-modal-close');
        }
      }

      function openModal() {
        isMounted = true;
        isVisible = true;
        syncClasses();
      }

      function closeModal() {
        if (!isMounted) return;
        isVisible = false;
        syncClasses();
      }

      tvModal.addEventListener('animationend', () => {
        if (!isVisible) {
          isMounted = false;
          syncClasses();
        }
      });

      openBtn.addEventListener('click', openModal);
      closeOutsideBtn.addEventListener('click', closeModal);
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);
      tvModal.addEventListener('click', (event) => event.stopPropagation());
    })();
  </script>
</body>
</html>`;

export const ANIMATION_LAB_DAY_TO_NIGHT_HTML = withDayNightSliderPreset(
  ANIMATION_LAB_DAY_NIGHT_SLIDER_HTML,
  '하루 넘김 - 밤 진입',
  100
);

export const ANIMATION_LAB_NEXT_DAY_HTML = withDayNightSliderPreset(
  ANIMATION_LAB_DAY_NIGHT_SLIDER_HTML,
  '하루 넘김 - 다음날 진행',
  200
);

export const ANIMATION_LAB_TRUCK_MOVE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>European Truck Animation</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    overflow: hidden;
    background: transparent;
  }

  .scene {
    width: 100vw;
    height: 260px;
    position: relative;
    overflow: hidden;
    background: transparent;
  }

  .truck {
    position: absolute;
    left: -650px;
    bottom: 35px;
    width: 650px;
    height: 190px;
    animation: truckMove 7s linear infinite;
  }

  .truck-body {
    animation: bodyBounce 0.45s ease-in-out infinite alternate;
    transform-origin: center bottom;
  }

  .wheel {
    transform-box: fill-box;
    transform-origin: center;
    animation: wheelSpin 0.45s linear infinite;
  }

  @keyframes truckMove {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(100vw + 760px));
    }
  }

  @keyframes wheelSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bodyBounce {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(3px);
    }
  }
</style>
</head>

<body>
  <div class="scene">
    <svg class="truck" viewBox="0 0 650 190" xmlns="http://www.w3.org/2000/svg">

      <g class="truck-body">

        <!-- 뒤 컨테이너 적재함 -->
        <rect x="25" y="42" width="370" height="95" rx="4"
              fill="#1f63b5"
              stroke="#102c4d"
              stroke-width="5" />

        <!-- 컨테이너 세로 주름 -->
        <g stroke="#0f3f7a" stroke-width="3">
          <line x1="55" y1="45" x2="55" y2="135"/>
          <line x1="85" y1="45" x2="85" y2="135"/>
          <line x1="115" y1="45" x2="115" y2="135"/>
          <line x1="145" y1="45" x2="145" y2="135"/>
          <line x1="175" y1="45" x2="175" y2="135"/>
          <line x1="205" y1="45" x2="205" y2="135"/>
          <line x1="235" y1="45" x2="235" y2="135"/>
          <line x1="265" y1="45" x2="265" y2="135"/>
          <line x1="295" y1="45" x2="295" y2="135"/>
          <line x1="325" y1="45" x2="325" y2="135"/>
          <line x1="355" y1="45" x2="355" y2="135"/>
        </g>

        <!-- 컨테이너 상단/하단 프레임 강조 -->
        <rect x="22" y="38" width="376" height="10" rx="3" fill="#164b8f"/>
        <rect x="20" y="135" width="410" height="18" rx="3" fill="#14202a"/>

        <!-- 유럽식 캡오버 운전석 본체 -->
        <path d="
          M398 55
          L515 55
          C535 55 548 70 552 92
          L557 138
          C558 148 552 154 542 154
          L398 154
          Z"
          fill="#f4a51c"
          stroke="#2b1a00"
          stroke-width="5" />

        <!-- 유럽 트럭 특유의 높은 루프 -->
        <path d="
          M405 28
          L500 28
          C520 30 540 45 548 63
          L400 63
          Z"
          fill="#ffbe2e"
          stroke="#2b1a00"
          stroke-width="5" />

        <!-- 앞이 평평한 캡오버 전면 -->
        <path d="
          M510 62
          C535 65 547 80 550 105
          L553 138
          L522 138
          L515 105
          Z"
          fill="#e88d12"
          stroke="#2b1a00"
          stroke-width="4" />

        <!-- 큰 전면 유리창 -->
        <path d="
          M426 65
          L503 65
          C517 66 527 78 531 96
          L529 108
          L426 108
          Z"
          fill="#63b7dc"
          stroke="#17313d"
          stroke-width="4" />

        <!-- 유리 반사 -->
        <path d="
          M440 70
          L472 70
          L447 104
          L428 104
          Z"
          fill="rgba(255,255,255,0.28)" />

        <!-- 옆 창문 -->
        <rect x="410" y="72" width="42" height="39" rx="5"
              fill="#4fa7cf"
              stroke="#17313d"
              stroke-width="4" />

        <!-- 문 라인 -->
        <line x1="458" y1="66" x2="458" y2="151"
              stroke="#8a5600"
              stroke-width="3" />

        <!-- 문 손잡이 -->
        <rect x="468" y="116" width="25" height="7" rx="3"
              fill="#202020" />

        <!-- 전면 그릴 -->
        <rect x="520" y="105" width="26" height="28" rx="4"
              fill="#252525"
              stroke="#111"
              stroke-width="3" />

        <g stroke="#555" stroke-width="3">
          <line x1="524" y1="112" x2="542" y2="112"/>
          <line x1="524" y1="120" x2="542" y2="120"/>
          <line x1="524" y1="128" x2="542" y2="128"/>
        </g>

        <!-- 전조등 -->
        <rect x="526" y="137" width="22" height="12" rx="3"
              fill="#ffe7a0"
              stroke="#111"
              stroke-width="2" />

        <!-- 앞 범퍼 -->
        <rect x="510" y="148" width="50" height="15" rx="4"
              fill="#333"
              stroke="#111"
              stroke-width="3" />

        <!-- 사이드 미러 -->
        <line x1="505" y1="76" x2="555" y2="67"
              stroke="#111"
              stroke-width="5" />
        <rect x="550" y="57" width="24" height="19" rx="4"
              fill="#222" />

        <!-- 운전석 뒤 검은 흡기/장식 -->
        <rect x="388" y="68" width="18" height="68" rx="5"
              fill="#1e1e1e"
              stroke="#111"
              stroke-width="3" />

        <g stroke="#444" stroke-width="3">
          <line x1="392" y1="80" x2="403" y2="80"/>
          <line x1="392" y1="92" x2="403" y2="92"/>
          <line x1="392" y1="104" x2="403" y2="104"/>
          <line x1="392" y1="116" x2="403" y2="116"/>
        </g>

        <!-- 하부 프레임 -->
        <rect x="55" y="148" width="470" height="13" rx="4"
              fill="#1b1b1b" />

        <rect x="260" y="158" width="160" height="12" rx="4"
              fill="#444" />

        <!-- 연료탱크 -->
        <rect x="345" y="140" width="58" height="18" rx="6"
              fill="#b7b7b7"
              stroke="#555"
              stroke-width="3" />

        <!-- 작은 표시등 -->
        <rect x="55" y="140" width="16" height="7" rx="2" fill="#ff9d00"/>
        <rect x="205" y="140" width="16" height="7" rx="2" fill="#ff9d00"/>
        <rect x="350" y="140" width="16" height="7" rx="2" fill="#ff9d00"/>
        <rect x="520" y="92" width="12" height="6" rx="2" fill="#ff9d00"/>

        <!-- 뒤쪽 후미등 -->
        <rect x="12" y="145" width="12" height="18" rx="2"
              fill="#ff3333"
              stroke="#111"
              stroke-width="2" />

      </g>

      <!-- 뒷바퀴 1 -->
      <g class="wheel">
        <circle cx="125" cy="160" r="35" fill="#151515"/>
        <circle cx="125" cy="160" r="25" fill="#2a2a2a"/>
        <circle cx="125" cy="160" r="20" fill="#cfcfcf" stroke="#333" stroke-width="4"/>
        <circle cx="125" cy="160" r="7" fill="#333"/>

        <line x1="125" y1="140" x2="125" y2="180" stroke="#555" stroke-width="4"/>
        <line x1="105" y1="160" x2="145" y2="160" stroke="#555" stroke-width="4"/>
        <line x1="111" y1="146" x2="139" y2="174" stroke="#555" stroke-width="4"/>
        <line x1="139" y1="146" x2="111" y2="174" stroke="#555" stroke-width="4"/>
      </g>

      <!-- 뒷바퀴 2 -->
      <g class="wheel">
        <circle cx="235" cy="160" r="35" fill="#151515"/>
        <circle cx="235" cy="160" r="25" fill="#2a2a2a"/>
        <circle cx="235" cy="160" r="20" fill="#cfcfcf" stroke="#333" stroke-width="4"/>
        <circle cx="235" cy="160" r="7" fill="#333"/>

        <line x1="235" y1="140" x2="235" y2="180" stroke="#555" stroke-width="4"/>
        <line x1="215" y1="160" x2="255" y2="160" stroke="#555" stroke-width="4"/>
        <line x1="221" y1="146" x2="249" y2="174" stroke="#555" stroke-width="4"/>
        <line x1="249" y1="146" x2="221" y2="174" stroke="#555" stroke-width="4"/>
      </g>

      <!-- 앞바퀴 -->
      <g class="wheel">
        <circle cx="475" cy="160" r="35" fill="#151515"/>
        <circle cx="475" cy="160" r="25" fill="#2a2a2a"/>
        <circle cx="475" cy="160" r="20" fill="#cfcfcf" stroke="#333" stroke-width="4"/>
        <circle cx="475" cy="160" r="7" fill="#333"/>

        <line x1="475" y1="140" x2="475" y2="180" stroke="#555" stroke-width="4"/>
        <line x1="455" y1="160" x2="495" y2="160" stroke="#555" stroke-width="4"/>
        <line x1="461" y1="146" x2="489" y2="174" stroke="#555" stroke-width="4"/>
        <line x1="489" y1="146" x2="461" y2="174" stroke="#555" stroke-width="4"/>
      </g>

    </svg>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_DSA_HTML = `<!DOCTYPE html>
<html lang="ko"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>지게차 애니메이션</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #eef3f7;
      overflow: hidden;
    }

    .scene {
      position: relative;
      width: 1000px;
      height: 360px;
      overflow: hidden;
      background: #d9ecff;
      border-radius: 20px;
      border: 4px solid #2f3a45;
    }

    .asphalt {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 62px;
      background:
        linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,0) 18px),
        linear-gradient(180deg, #6b7681 0 5px, #c5cbd1 5px 100%);
      box-shadow:
        inset 0 8px 10px rgba(255,255,255,.1),
        inset 0 -10px 18px rgba(0,0,0,.08);
    }

    .lane-dashes {
      position: absolute;
      left: 0;
      bottom: 10px;
      width: 200%;
      height: 6px;
      background: repeating-linear-gradient(
        to right,
        #fff 0 55px,
        transparent 55px 100px
      );
      animation: roadMove .68s linear infinite;
    }

    .lane-dashes::before {
      content: "";
      position: absolute;
      inset: -18px 0 auto;
      height: 16px;
      background: linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,0));
      opacity: .45;
    }

    .transport-label {
      position: absolute;
      left: 50%;
      top: 84px;
      transform: translateX(-50%);
      z-index: 5;
      pointer-events: none;
    }

    .transport-gauge {
      position: absolute;
      left: 50%;
      top: 112px;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      width: min(360px, calc(100% - 260px));
      z-index: 5;
      pointer-events: none;
    }

    .transport-gauge__label {
      padding: 4px 12px 5px;
      margin-bottom: 4px;
      border-radius: 999px;
      border: 1px solid rgba(214, 220, 224, 0.34);
      background: linear-gradient(180deg, rgba(88, 95, 102, 0.92), rgba(58, 64, 70, 0.94));
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.15),
        0 4px 10px rgba(38, 43, 48, .16);
      font: 900 13px/1 "Arial", sans-serif;
      letter-spacing: -0.02em;
      color: #eefcf5;
      text-shadow: 0 1px 0 rgba(0,0,0,.18);
    }

    .transport-gauge__track {
      position: relative;
      width: 100%;
      height: 13px;
      overflow: hidden;
      border-radius: 999px;
      background:
        linear-gradient(180deg, rgba(242, 244, 245, 0.96), rgba(202, 207, 211, 0.96));
      border: 1px solid rgba(88, 97, 104, 0.34);
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,.76),
        inset 0 -1px 2px rgba(73, 80, 86, .14),
        0 5px 12px rgba(58, 64, 70, .14);
    }

    .transport-gauge__fill {
      position: absolute;
      inset: 0 auto 0 0;
      width: 0;
      border-radius: inherit;
      background:
        repeating-linear-gradient(
          -60deg,
          #a9b1b6 0 14px,
          #848e95 14px 26px
        ),
        linear-gradient(90deg, #b9c1c6 0%, #8f999f 48%, #6e787f 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.28),
        0 0 10px rgba(96,104,112,.16);
      animation: transportGaugeFill 1200ms linear infinite;
    }

    .transport-gauge__fill::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,0) 56%),
        linear-gradient(90deg, transparent 0%, rgba(92,102,110,.46) 88%, rgba(238,242,244,.84) 100%);
    }

    .forklift {
      position: absolute;
      left: calc(50% - 180px);
      bottom: 17px;
      width: 360px;
      height: 190px;
    }

    .forklift-inner {
      position: absolute;
      inset: 0;
      animation: bounce 1.18s ease-in-out infinite;
    }

    .shadow {
      position: absolute;
      left: 48px;
      bottom: 0;
      width: 300px;
      height: 18px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,.26), rgba(0,0,0,0));
      border-radius: 50%;
      filter: blur(6px);
      animation: shadowPulse 1.18s ease-in-out infinite;
    }

    .body {
      position: absolute;
      left: 70px;
      bottom: 35px;
      width: 150px;
      height: 74px;
      background:
        linear-gradient(180deg, rgba(255,255,255,.28), transparent 34%),
        linear-gradient(90deg, #ffb62c 0 16%, #ffb11a 16% 70%, #e6921f 70% 100%);
      border: 5px solid #2f2f2f;
      border-radius: 14px 18px 10px 10px;
      box-shadow: inset 0 -12px 0 rgba(0,0,0,.08);
    }

    .body::before {
      content: "";
      position: absolute;
      left: 15px;
      top: 15px;
      width: 46px;
      height: 22px;
      background: linear-gradient(180deg, #ffd888, #ffc457);
      border-radius: 5px;
      border: 3px solid #2f2f2f;
    }

    .body::after {
      content: "";
      position: absolute;
      right: 16px;
      top: 14px;
      width: 28px;
      height: 18px;
      border-radius: 10px 10px 6px 6px;
      background: linear-gradient(180deg, #ffefb7, #ffcf5c);
      border: 3px solid #2f2f2f;
      box-shadow: 0 0 14px rgba(255,212,90,.24);
    }

    .cabin {
      position: absolute;
      left: 112px;
      bottom: 104px;
      width: 78px;
      height: 64px;
      border: 6px solid #2f2f2f;
      border-bottom: none;
      border-radius: 14px 14px 0 0;
      background:
        linear-gradient(120deg, rgba(255,255,255,.5) 0 28%, rgba(255,255,255,0) 28% 55%),
        linear-gradient(180deg, rgba(138,198,236,.55), rgba(104,161,202,.38));
    }

    .roof {
      position: absolute;
      left: 103px;
      bottom: 164px;
      width: 98px;
      height: 12px;
      background: linear-gradient(180deg, #43484f, #262a30);
      border-radius: 8px;
    }

    .seat {
      position: absolute;
      left: 132px;
      bottom: 92px;
      width: 26px;
      height: 28px;
      background: linear-gradient(180deg, #4a4d54, #262a2f);
      border-radius: 8px 8px 6px 6px;
      box-shadow: 0 10px 0 -4px #30353b;
    }

    .steering {
      position: absolute;
      left: 162px;
      bottom: 116px;
      width: 24px;
      height: 24px;
      border: 4px solid #2d3136;
      border-radius: 50%;
      transform: rotate(-14deg);
    }

    .steering::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 4px;
      height: 20px;
      background: #2d3136;
      transform: translate(-50%, -50%) rotate(32deg);
      border-radius: 3px;
    }

    .mast {
      position: absolute;
      left: 225px;
      bottom: 36px;
      width: 16px;
      height: 132px;
      background: linear-gradient(90deg, #23272c, #4b525a 48%, #1f2327 100%);
      border-radius: 5px;
    }

    .mast::before {
      content: "";
      position: absolute;
      left: 22px;
      top: 4px;
      width: 10px;
      height: 122px;
      background: linear-gradient(90deg, #42474e, #262a2e);
      border-radius: 5px;
    }

    .mast::after {
      content: "";
      position: absolute;
      left: 8px;
      top: 12px;
      width: 26px;
      height: 6px;
      background: repeating-linear-gradient(
        90deg,
        #1e2227 0 4px,
        #8b9198 4px 6px
      );
      box-shadow:
        0 24px 0 0 rgba(48,54,60,.95),
        0 48px 0 0 rgba(48,54,60,.95),
        0 72px 0 0 rgba(48,54,60,.95),
        0 96px 0 0 rgba(48,54,60,.95);
    }

    .forks {
      position: absolute;
      left: 235px;
      bottom: 50px;
      width: 105px;
      height: 10px;
      background: linear-gradient(180deg, #494f57, #1f2327);
      border-radius: 5px;
    }

    .forks::before,
    .forks::after {
      content: "";
      position: absolute;
      bottom: -12px;
      width: 44px;
      height: 12px;
      background: linear-gradient(180deg, #434851, #1f2327);
      border-radius: 0 0 4px 4px;
    }

    .forks::before {
      left: 4px;
    }

    .forks::after {
      right: 6px;
    }

    .pallet {
      position: absolute;
      left: 248px;
      bottom: 63px;
      width: 92px;
      height: 20px;
      background: linear-gradient(180deg, #9f6b34, #7a4e23);
      border: 4px solid #4a2c12;
      border-radius: 3px;
    }

    .pallet::before {
      content: "";
      position: absolute;
      inset: 4px 6px auto;
      height: 4px;
      background: repeating-linear-gradient(
        90deg,
        rgba(255,255,255,.24) 0 14px,
        rgba(255,255,255,0) 14px 24px
      );
    }

    .pallet::after {
      content: "";
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: -10px;
      height: 10px;
      background: repeating-linear-gradient(
        90deg,
        #5f3918 0 12px,
        transparent 12px 28px
      );
    }

    .box {
      position: absolute;
      background:
        linear-gradient(180deg, rgba(255,255,255,.18), transparent 30%),
        linear-gradient(90deg, #ba7a39 0 72%, #935721 72% 100%);
      border: 4px solid #5c3417;
      box-shadow: inset 0 -8px 0 rgba(0,0,0,.08);
    }

    .box::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 0;
      width: 4px;
      height: 100%;
      background: rgba(92,52,23,.55);
      transform: translateX(-50%);
    }

    .box::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 4px;
      background: rgba(92,52,23,.35);
      transform: translateY(-50%);
    }

    .box.one {
      left: 255px;
      bottom: 83px;
      width: 42px;
      height: 42px;
    }

    .box.two {
      left: 298px;
      bottom: 83px;
      width: 38px;
      height: 42px;
      background:
        linear-gradient(180deg, rgba(255,255,255,.2), transparent 30%),
        linear-gradient(90deg, #cb8c43 0 72%, #a76726 72% 100%);
    }

    .box.three {
      left: 274px;
      bottom: 125px;
      width: 42px;
      height: 36px;
      background:
        linear-gradient(180deg, rgba(255,255,255,.16), transparent 30%),
        linear-gradient(90deg, #ae6f31 0 72%, #8e531f 72% 100%);
    }

    .warning-stripe {
      position: absolute;
      left: 86px;
      bottom: 28px;
      width: 112px;
      height: 8px;
      border-radius: 4px;
      background: repeating-linear-gradient(
        90deg,
        #232323 0 12px,
        #f8d546 12px 24px
      );
      opacity: .95;
    }

    .wheel {
      position: absolute;
      --wheel-tire-border: 6px;
      --wheel-rim-gap: 13px;
      --wheel-rim-border: 1px;
      --wheel-tread-band: 8px;
      --wheel-rim-highlight: #d9dde0;
      --wheel-rim-mid: #aab2b9;
      --wheel-rim-dark: #555e66;
      --wheel-rim-core: #394149;
      --wheel-rotor-gap: 6px;
      --wheel-rotor-highlight: #a8b0b7;
      --wheel-rotor-mid: #697179;
      --wheel-rotor-dark: #2b3238;
      --wheel-hub-size: 12px;
      --wheel-hub-ring: 2px;
      --wheel-hub-outer-glow: 0px;
      border-radius: 50%;
      overflow: hidden;
    }

    .wheel__spin {
      position: absolute;
      inset: 0;
      animation: wheelSpin .82s linear infinite;
    }

    .wheel__tire-shell {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.06) 0 16%, rgba(255,255,255,0) 17% 100%),
        radial-gradient(circle at 50% 45%, #303030 0 18%, #1f1f1f 38%, #111111 68%, #070707 100%);
      border: var(--wheel-tire-border) solid #101010;
      border-radius: 50%;
      box-shadow:
        inset 0 0 0 2px #262626,
        inset 0 -7px 10px rgba(0,0,0,.42),
        inset 0 6px 7px rgba(255,255,255,.06),
        0 7px 12px rgba(0,0,0,.18);
    }

    .wheel__tread {
      position: absolute;
      inset: 0;
      background: repeating-conic-gradient(
        from 0deg,
        rgba(255,255,255,.18) 0deg 8deg,
        rgba(255,255,255,0) 8deg 20deg,
        rgba(255,255,255,.1) 20deg 27deg,
        rgba(255,255,255,0) 27deg 40deg
      );
      border-radius: 50%;
      opacity: .72;
      -webkit-mask-image: radial-gradient(circle, transparent calc(50% - var(--wheel-tread-band)), #000 calc(50% - var(--wheel-tread-band) + 2px));
      mask-image: radial-gradient(circle, transparent calc(50% - var(--wheel-tread-band)), #000 calc(50% - var(--wheel-tread-band) + 2px));
      pointer-events: none;
    }

    .wheel__rim {
      position: absolute;
      inset: var(--wheel-rim-gap);
      border-radius: 50%;
      border: var(--wheel-rim-border) solid rgba(214,221,227,.92);
      box-shadow:
        inset 0 0 0 1px rgba(78,86,94,.9),
        0 0 0 1px rgba(255,255,255,.08);
      background: transparent;
      pointer-events: none;
    }

    /* 뒷바퀴 */
    .back-wheel {
      left: 64px;
      width: 52px;
      height: 52px;
      bottom: 10px;
      --wheel-tread-band: 8px;
      --wheel-rim-gap: 12px;
      --wheel-rim-border: 1px;
      --wheel-rotor-gap: 6px;
      --wheel-hub-size: 9px;
      --wheel-hub-ring: 2px;
      --wheel-hub-outer-glow: 0px;
    }

    /* 앞바퀴 크게 */
    .front-wheel {
      left: 160px;
      width: 68px;
      height: 68px;
      bottom: 0;
      --wheel-tread-band: 10px;
      --wheel-rim-gap: 16px;
      --wheel-rim-border: 1px;
      --wheel-rotor-gap: 7px;
      --wheel-hub-size: 12px;
      --wheel-hub-ring: 3px;
      --wheel-hub-outer-glow: 0px;
    }

    .dust {
      position: absolute;
      left: 20px;
      bottom: 20px;
      width: 10px;
      height: 10px;
      background: rgba(80,80,80,.3);
      border-radius: 50%;
      opacity: 0;
    }

    .dust.two {
      left: 2px;
      animation-delay: .25s;
    }

    .dust.three {
      left: 36px;
      animation-delay: .45s;
    }

    @keyframes drive {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(1450px);
      }
    }

    @keyframes bounce {
      0%,
      100% {
        transform: translateY(0);
      }

      30% {
        transform: translateY(-1px);
      }

      58% {
        transform: translateY(-1.8px);
      }

      74% {
        transform: translateY(-0.8px);
      }
    }

    @keyframes shadowPulse {
      0%,
      100% {
        transform: scaleX(1) translateY(0);
        opacity: .24;
      }

      30% {
        transform: scaleX(.992) translateY(.2px);
        opacity: .22;
      }

      58% {
        transform: scaleX(.985) translateY(.5px);
        opacity: .19;
      }

      74% {
        transform: scaleX(.994) translateY(.15px);
        opacity: .215;
      }
    }

    @keyframes wheelSpin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes roadMove {
      from {
        transform: translateX(0);
      }

      to {
        transform: translateX(-100px);
      }
    }

    @keyframes transportGaugeFill {
      from {
        width: 0;
      }

      to {
        width: 100%;
      }
    }

    @keyframes dust {
      from {
        transform: translateX(0) scale(.4);
        opacity: .5;
      }

      to {
        transform: translateX(-45px) scale(1.5);
        opacity: 0;
      }
    }
  </style>
</head>
<body>

  <div class="scene" style="transform: translate(0px, 0px);">
    <div class="asphalt" style="transform: translate(0px, 0px);"></div>
    <div class="lane-dashes"></div>
    <div class="transport-label">
      <div class="transport-gauge__label">운반중</div>
    </div>
    <div class="transport-gauge" aria-label="운반중 게이지">
      <div class="transport-gauge__track">
        <div class="transport-gauge__fill"></div>
      </div>
    </div>

    <div class="forklift" style="transform: translate(0px, -58px) translate(0px, 64px);">
      <div class="forklift-inner">

        <div class="shadow" style="opacity: 0.24;"></div>

        <div class="dust" style="opacity: 0; transform: translate(0px, 0px);"></div>
        <div class="dust two" style="opacity: 0;"></div>
        <div class="dust three" style="opacity: 0;"></div>

        <div class="roof"></div>
        <div class="cabin"></div>
        <div class="seat"></div>
        <div class="steering"></div>

        <div class="body"></div>
        <div class="warning-stripe" style="opacity: 0.95;"></div>

        <div class="mast"></div>
        <div class="forks" style="transform: translate(0px, 0px);"></div>

        <div class="pallet" style="transform: translate(0px, 17px);"></div>

        <div class="box one" style="transform: translate(0px, 18px);"></div>
        <div class="box two" style="transform: translate(0px, 18px);"></div>
        <div class="box three" style="transform: translate(0px, 18px);"></div>

        <div class="wheel back-wheel">
          <div class="wheel__spin">
            <div class="wheel__tire-shell"></div>
            <div class="wheel__tread" style="opacity: 0.9;"></div>
            <div class="wheel__rim"></div>
          </div>
        </div>
        <div class="wheel front-wheel" style="transform: translate(0px, -9px);">
          <div class="wheel__spin">
            <div class="wheel__tire-shell"></div>
            <div class="wheel__tread" style="opacity: 0.9;"></div>
            <div class="wheel__rim"></div>
          </div>
        </div>

      </div>
    </div>
  </div>



</body></html>`;

export const ANIMATION_LAB_CARD_PAYMENT_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>구버전 카드애니메이션</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      overflow: hidden;
      background:
        radial-gradient(circle at top, rgba(116, 84, 58, 0.3), transparent 38%),
        linear-gradient(180deg, #2a221d 0%, #18120f 100%);
      font-family: Arial, sans-serif;
      color: #f7f1e8;
    }
    .scene {
      position: relative;
      width: min(760px, 100vw);
      height: min(520px, 100vh);
      overflow: hidden;
    }
    .counter-glow {
      position: absolute;
      inset: auto 0 24px 0;
      margin: auto;
      width: 520px;
      height: 96px;
      background: radial-gradient(circle, rgba(255, 179, 90, 0.18), transparent 68%);
      filter: blur(10px);
    }
    .terminal-shadow {
      position: absolute;
      left: 50%;
      bottom: 72px;
      width: 300px;
      height: 44px;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.42);
      filter: blur(14px);
      border-radius: 50%;
    }
    .terminal {
      position: absolute;
      left: 50%;
      bottom: 94px;
      width: 304px;
      height: 298px;
      transform: translateX(-50%);
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0) 18%),
        linear-gradient(180deg, #5d6670 0%, #363d46 54%, #1d232a 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.28),
        inset 0 -10px 18px rgba(0,0,0,0.26),
        0 22px 36px rgba(0,0,0,0.34);
      z-index: 2;
    }
    .terminal::before {
      content: "";
      position: absolute;
      left: 24px;
      right: 24px;
      top: 22px;
      height: 98px;
      border-radius: 16px;
      background:
        linear-gradient(180deg, rgba(182, 255, 205, 0.32), rgba(63, 132, 88, 0.15)),
        #08130d;
      border: 1px solid rgba(145, 226, 170, 0.2);
      box-shadow: inset 0 0 18px rgba(88, 255, 146, 0.14);
    }
    .terminal::after {
      content: "";
      position: absolute;
      left: 76px;
      bottom: 20px;
      width: 152px;
      height: 18px;
      border-radius: 999px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 32%),
        linear-gradient(180deg, #404851 0%, #1d232a 55%, #0c0f13 100%);
      box-shadow:
        inset 0 2px 4px rgba(255,255,255,0.06),
        inset 0 -4px 6px rgba(0,0,0,0.42);
      z-index: 4;
      pointer-events: none;
    }
    .screen {
      position: absolute;
      left: 38px;
      right: 38px;
      top: 36px;
      height: 70px;
      overflow: hidden;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #d7ffe3;
      text-shadow: 0 0 12px rgba(77, 255, 136, 0.22);
    }
    .screen__line {
      position: absolute;
      inset: 0;
      display: grid;
      align-content: center;
      justify-items: center;
      gap: 5px;
      opacity: 0;
    }
    .screen__line strong { font-size: 18px; }
    .screen__line span { font-size: 11px; opacity: 0.82; }
    .screen__line--ready { animation: screenReady 4.8s linear infinite; }
    .screen__line--processing { animation: screenProcessing 4.8s linear infinite; }
    .screen__line--approved { animation: screenApproved 4.8s linear infinite; }
    .keypad {
      position: absolute;
      left: 36px;
      right: 36px;
      bottom: 60px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }
    .key {
      height: 20px;
      border-radius: 7px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03)),
        #232931;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.16),
        inset 0 -2px 4px rgba(0,0,0,0.28);
    }
    .key:nth-child(10) { background: linear-gradient(180deg, #f6d46b, #a06a13); }
    .key:nth-child(11) { background: linear-gradient(180deg, #ef8a75, #9f2f22); }
    .key:nth-child(12) { background: linear-gradient(180deg, #97d990, #2e7a35); }
    .slot {
      position: absolute;
      left: 50%;
      top: 128px;
      width: 186px;
      height: 8px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: transparent;
      box-shadow: none;
      overflow: hidden;
    }
    .slot::after {
      content: none;
    }
    .slot::before {
      content: none;
    }
    .card {
      position: absolute;
      left: calc(50% - 226px);
      top: 38px;
      width: 276px;
      height: 172px;
      padding: 22px 24px;
      border-radius: 18px;
      transform: rotate(-8deg);
      transform-origin: center center;
      background:
        radial-gradient(circle at 20% 18%, rgba(255,255,255,0.24), transparent 18%),
        linear-gradient(135deg, #5b1216 0%, #8d2024 38%, #341113 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.22),
        0 18px 28px rgba(0,0,0,0.28);
      animation: cardSwipe 4.8s cubic-bezier(.22,.61,.36,1) infinite;
      z-index: 1;
    }
    .card::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background:
        linear-gradient(125deg, rgba(255,255,255,0.18), transparent 32%),
        linear-gradient(300deg, rgba(255,255,255,0.1), transparent 46%);
      pointer-events: none;
    }
    .card-chip {
      width: 42px;
      height: 30px;
      border-radius: 8px;
      background: linear-gradient(180deg, #ecd89f, #b88932);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.34);
    }
    .card-brand {
      position: absolute;
      right: 24px;
      top: 24px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.18em;
      opacity: 0.86;
    }
    .card-number {
      position: absolute;
      left: 24px;
      bottom: 52px;
      font-size: 20px;
      letter-spacing: 0.16em;
      font-weight: 700;
    }
    .card-holder {
      position: absolute;
      left: 24px;
      bottom: 24px;
      font-size: 11px;
      letter-spacing: 0.14em;
      opacity: 0.82;
    }
    .swipe-glint {
      position: absolute;
      left: 50%;
      top: 123px;
      width: 186px;
      height: 16px;
      border-radius: 999px;
      transform: translateX(-50%);
      opacity: 0;
      overflow: hidden;
      animation: swipeGlow 4.8s linear infinite;
      z-index: 5;
    }
    .swipe-glint::before,
    .swipe-glint::after {
      content: "";
      position: absolute;
      top: 1px;
      bottom: 1px;
      width: 44px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(125, 255, 170, 0), rgba(125, 255, 170, 0.72), rgba(125, 255, 170, 0));
    }
    .swipe-glint::before {
      left: -44px;
      animation: swipeTrail 4.8s linear infinite;
    }
    .swipe-glint::after {
      left: -24px;
      width: 24px;
      opacity: 0.55;
      animation: swipeTrail 4.8s linear infinite;
      animation-delay: 0.08s;
    }
    .receipt {
      position: absolute;
      left: 50%;
      top: 388px;
      width: 152px;
      height: 128px;
      padding: 12px 14px;
      transform: translateX(-50%);
      border-radius: 8px 8px 12px 12px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0)),
        #f4efe7;
      color: #3f362c;
      box-shadow:
        0 14px 20px rgba(0,0,0,0.18),
        inset 0 1px 0 rgba(255,255,255,0.6);
      opacity: 0;
      animation: receiptPrint 4.8s ease-in-out infinite;
      z-index: 3;
    }
    .receipt::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -10px;
      height: 12px;
      background:
        linear-gradient(-45deg, transparent 8px, #f4efe7 0) bottom left / 16px 12px repeat-x,
        linear-gradient(45deg, transparent 8px, #f4efe7 0) bottom left / 16px 12px repeat-x;
    }
    .receipt__row {
      height: 8px;
      margin-bottom: 8px;
      border-radius: 999px;
      background: rgba(72, 60, 48, 0.16);
    }
    .receipt__row--title { width: 58%; height: 10px; background: rgba(72,60,48,0.28); }
    .receipt__row--amount { width: 78%; height: 11px; background: rgba(45,120,73,0.44); }
    .receipt__badge {
      position: absolute;
      right: 14px;
      bottom: 18px;
      font-size: 12px;
      font-weight: 800;
      color: #2d8c4e;
    }
    .amount-tag {
      position: absolute;
      right: 48px;
      top: 34px;
      padding: 10px 14px;
      border-radius: 14px;
      background: rgba(17, 22, 28, 0.68);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 10px 20px rgba(0,0,0,0.22);
      text-align: right;
    }
    .amount-tag small {
      display: block;
      margin-bottom: 4px;
      font-size: 11px;
      opacity: 0.7;
    }
    .amount-tag strong {
      font-size: 26px;
      letter-spacing: 0.04em;
    }
    @keyframes cardSwipe {
      0%, 10% {
        transform: translate(0, 0) rotate(-8deg);
      }
      26% {
        transform: translate(180px, 62px) rotate(-2.8deg);
      }
      40% {
        transform: translate(318px, 64px) rotate(0deg);
      }
      54% {
        transform: translate(430px, 26px) rotate(5.2deg);
      }
      100% {
        transform: translate(492px, -18px) rotate(9.6deg);
      }
    }
    @keyframes swipeGlow {
      0%, 22% { opacity: 0; }
      28%, 50% { opacity: 1; }
      54%, 100% { opacity: 0; }
    }
    @keyframes swipeTrail {
      0%, 22% { transform: translateX(0); opacity: 0; }
      30% { transform: translateX(28px); opacity: 0.9; }
      39% { transform: translateX(120px); opacity: 0.8; }
      49% { transform: translateX(214px); opacity: 0.2; }
      50%, 100% { transform: translateX(214px); opacity: 0; }
    }
    @keyframes receiptPrint {
      0%, 40% { opacity: 0; transform: translateX(-50%) translateY(-88px); }
      49% { opacity: 0.98; transform: translateX(-50%) translateY(-22px); }
      66% { opacity: 0.98; transform: translateX(-50%) translateY(14px); }
      100% { opacity: 0; transform: translateX(-50%) translateY(42px); }
    }
    @keyframes screenReady {
      0%, 22% { opacity: 1; }
      23%, 100% { opacity: 0; }
    }
    @keyframes screenProcessing {
      0%, 22% { opacity: 0; }
      24%, 62% { opacity: 1; }
      63%, 100% { opacity: 0; }
    }
    @keyframes screenApproved {
      0%, 61% { opacity: 0; }
      64%, 90% { opacity: 1; }
      91%, 100% { opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="scene">
    <div class="counter-glow"></div>
    <div class="amount-tag"><small>결제금액</small><strong>₩ 184,000</strong></div>
    <div class="terminal-shadow"></div>
    <div class="terminal">
      <div class="screen">
        <div class="screen__line screen__line--ready">
          <strong>카드를 긁어주세요</strong>
          <span>마그네틱 결제 대기중</span>
        </div>
        <div class="screen__line screen__line--processing">
          <strong>승인 요청중...</strong>
          <span>카드 정보 확인 중</span>
        </div>
        <div class="screen__line screen__line--approved">
          <strong>승인 완료</strong>
          <span>결제가 정상 처리되었습니다</span>
        </div>
      </div>
      <div class="slot"></div>
      <div class="keypad">
        <div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key"></div><div class="key"></div>
      </div>
    </div>
    <div class="swipe-glint"></div>
    <div class="receipt">
      <div class="receipt__row receipt__row--title"></div>
      <div class="receipt__row"></div>
      <div class="receipt__row"></div>
      <div class="receipt__row receipt__row--amount"></div>
      <div class="receipt__badge">APPROVED</div>
    </div>
    <div class="card">
      <div class="card-chip"></div>
      <div class="card-brand">NH PAY</div>
      <div class="card-number">5412 27•• •••• 6018</div>
      <div class="card-holder">YOUNG FARMER</div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_BANK_TRANSFER_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>계좌이체 애니메이션</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.16), transparent 30%),
        radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.18), transparent 34%),
        linear-gradient(135deg, #07111f, #101827 55%, #07111f);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .transfer-wrap {
      width: min(920px, calc(100vw - 32px));
      min-height: 310px;
      padding: 34px;
      display: grid;
      grid-template-columns: 1fr 220px 1fr;
      align-items: center;
      gap: 28px;
      border-radius: 34px;
      position: relative;
      overflow: hidden;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)),
        rgba(12, 20, 34, 0.84);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow:
        0 30px 80px rgba(0,0,0,0.42),
        inset 0 1px 0 rgba(255,255,255,0.16);
      backdrop-filter: blur(18px);
    }

    .transfer-wrap::before {
      content: "";
      position: absolute;
      inset: -50%;
      background: conic-gradient(
        from 120deg,
        transparent,
        rgba(52, 211, 153, 0.16),
        transparent,
        rgba(59, 130, 246, 0.14),
        transparent
      );
      animation: bgSpin 8s linear infinite;
    }

    .transfer-wrap > * {
      position: relative;
      z-index: 1;
    }

    .transfer-card {
      min-height: 190px;
      padding: 24px;
      border-radius: 26px;
      color: white;
      overflow: hidden;
      position: relative;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04)),
        linear-gradient(145deg, #14213b, #0c1324);
      border: 1px solid rgba(255,255,255,0.14);
      box-shadow:
        0 22px 45px rgba(0,0,0,0.28),
        inset 0 1px 0 rgba(255,255,255,0.16);
    }

    .transfer-card::before {
      content: "";
      position: absolute;
      width: 170px;
      height: 170px;
      right: -58px;
      top: -62px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }

    .transfer-card::after {
      content: "";
      position: absolute;
      width: 110px;
      height: 110px;
      right: 24px;
      bottom: -64px;
      border-radius: 50%;
      background: rgba(255,255,255,0.055);
    }

    .from-card {
      animation: debitShake 3.2s ease-in-out infinite;
    }

    .to-card {
      animation: creditPop 3.2s ease-in-out infinite;
    }

    .card-label {
      display: inline-flex;
      padding: 7px 11px;
      margin-bottom: 18px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #b7ffe2;
      background: rgba(52, 211, 153, 0.13);
      border: 1px solid rgba(52, 211, 153, 0.26);
    }

    .bank-name {
      font-size: 23px;
      font-weight: 900;
      letter-spacing: -0.04em;
    }

    .account {
      margin-top: 9px;
      color: rgba(255,255,255,0.62);
      font-size: 14px;
      letter-spacing: 0.04em;
    }

    .amount {
      margin-top: 27px;
      font-size: 28px;
      font-weight: 950;
      letter-spacing: -0.05em;
      color: #ffb4b4;
    }

    .amount.plus {
      color: #6effbd;
    }

    .transfer-road {
      height: 210px;
      display: grid;
      place-items: center;
      position: relative;
    }

    .road-line {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      position: relative;
      background: rgba(255,255,255,0.12);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.08),
        0 0 30px rgba(52, 211, 153, 0.16);
    }

    .road-line::before {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      border-radius: inherit;
      background: linear-gradient(90deg, transparent, #34d399, #60a5fa, transparent);
      animation: lineCharge 3.2s ease-in-out infinite;
    }

    .road-line::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: repeating-linear-gradient(
        90deg,
        transparent 0 12px,
        rgba(255,255,255,0.28) 12px 16px
      );
      opacity: 0.35;
      animation: dashMove 0.7s linear infinite;
    }

    .money-packet {
      width: 66px;
      height: 66px;
      position: absolute;
      left: -10px;
      top: 72px;
      display: grid;
      place-items: center;
      border-radius: 22px;
      color: #042015;
      font-size: 30px;
      font-weight: 950;
      background:
        radial-gradient(circle at 35% 28%, #ffffff, transparent 22%),
        linear-gradient(135deg, #86efac, #22c55e 52%, #16a34a);
      box-shadow:
        0 18px 35px rgba(34, 197, 94, 0.42),
        0 0 0 8px rgba(34, 197, 94, 0.09),
        inset 0 1px 0 rgba(255,255,255,0.72);
      animation: packetFly 3.2s cubic-bezier(.2,.9,.2,1) infinite;
    }

    .money-packet::before,
    .money-packet::after {
      content: "";
      position: absolute;
      inset: -10px;
      border-radius: 28px;
      border: 2px solid rgba(134, 239, 172, 0.5);
      opacity: 0;
      animation: packetRing 3.2s ease-out infinite;
    }

    .money-packet::after {
      animation-delay: 0.16s;
    }

    .money-packet span {
      transform: translateY(-1px);
      text-shadow: 0 1px 0 rgba(255,255,255,0.38);
    }

    .coin {
      position: absolute;
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 15px;
      font-weight: 950;
      color: #3f2a00;
      background: linear-gradient(135deg, #fde68a, #f59e0b);
      box-shadow: 0 10px 22px rgba(245, 158, 11, 0.35);
      opacity: 0;
    }

    .c1 {
      top: 48px;
      left: 24px;
      animation: coinSpark 3.2s ease-out infinite;
    }

    .c2 {
      top: 130px;
      left: 88px;
      animation: coinSpark 3.2s ease-out infinite;
      animation-delay: 0.16s;
    }

    .c3 {
      top: 42px;
      left: 146px;
      animation: coinSpark 3.2s ease-out infinite;
      animation-delay: 0.32s;
    }

    .transfer-status {
      position: absolute;
      bottom: 12px;
      left: 50%;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 10px 14px;
      border-radius: 999px;
      transform: translateX(-50%) translateY(10px) scale(0.92);
      opacity: 0;
      white-space: nowrap;
      color: #dfffee;
      font-size: 14px;
      font-weight: 900;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(52, 211, 153, 0.34);
      box-shadow: 0 15px 35px rgba(16, 185, 129, 0.18);
      animation: statusShow 3.2s ease-in-out infinite;
    }

    .check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      position: relative;
      background: #34d399;
      box-shadow: 0 0 0 5px rgba(52, 211, 153, 0.14);
    }

    .check::before {
      content: "";
      position: absolute;
      width: 9px;
      height: 5px;
      left: 5px;
      top: 6px;
      border-left: 3px solid #052e1c;
      border-bottom: 3px solid #052e1c;
      transform: rotate(-45deg);
    }

    @keyframes bgSpin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes debitShake {
      0%, 14%, 100% {
        transform: translateX(0);
        filter: brightness(1);
      }

      18% {
        transform: translateX(-5px) rotate(-0.6deg);
        filter: brightness(1.18);
      }

      23% {
        transform: translateX(4px) rotate(0.5deg);
      }

      28% {
        transform: translateX(0);
        filter: brightness(0.9);
      }
    }

    @keyframes creditPop {
      0%, 58%, 100% {
        transform: scale(1);
        filter: brightness(1);
      }

      70% {
        transform: scale(1.045);
        filter: brightness(1.23);
        box-shadow:
          0 24px 55px rgba(34, 197, 94, 0.28),
          inset 0 1px 0 rgba(255,255,255,0.18);
      }

      82% {
        transform: scale(1);
      }
    }

    @keyframes lineCharge {
      0%, 12% {
        transform: translateX(-100%);
      }

      68% {
        transform: translateX(0%);
      }

      100% {
        transform: translateX(100%);
      }
    }

    @keyframes dashMove {
      to {
        background-position-x: 32px;
      }
    }

    @keyframes packetFly {
      0% {
        left: -12px;
        transform: translateY(0) scale(0.72) rotate(-12deg);
        opacity: 0;
      }

      14% {
        opacity: 1;
        transform: translateY(0) scale(1) rotate(0deg);
      }

      34% {
        transform: translateY(-30px) scale(1.08) rotate(10deg);
      }

      55% {
        transform: translateY(24px) scale(0.96) rotate(-8deg);
      }

      72% {
        left: calc(100% - 54px);
        transform: translateY(0) scale(1.1) rotate(4deg);
        opacity: 1;
      }

      83% {
        left: calc(100% - 44px);
        transform: translateY(0) scale(0.55) rotate(0deg);
        opacity: 0;
      }

      100% {
        left: calc(100% - 44px);
        opacity: 0;
      }
    }

    @keyframes packetRing {
      15% {
        opacity: 0;
        transform: scale(0.8);
      }

      38% {
        opacity: 1;
      }

      72% {
        opacity: 0;
        transform: scale(1.42);
      }

      100% {
        opacity: 0;
      }
    }

    @keyframes coinSpark {
      0%, 18% {
        opacity: 0;
        transform: translate(0, 0) scale(0.5) rotate(0deg);
      }

      34% {
        opacity: 1;
      }

      62% {
        opacity: 0;
        transform: translate(38px, -28px) scale(1.05) rotate(240deg);
      }

      100% {
        opacity: 0;
      }
    }

    @keyframes statusShow {
      0%, 68% {
        opacity: 0;
        transform: translateX(-50%) translateY(10px) scale(0.92);
      }

      78%, 91% {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }

      100% {
        opacity: 0;
        transform: translateX(-50%) translateY(-6px) scale(0.96);
      }
    }

    @media (max-width: 760px) {
      .transfer-wrap {
        grid-template-columns: 1fr;
        gap: 18px;
        padding: 22px;
      }

      .transfer-road {
        height: 150px;
        transform: rotate(90deg);
      }

      .transfer-status {
        transform: translateX(-50%) translateY(10px) scale(0.92) rotate(-90deg);
      }

      @keyframes statusShow {
        0%, 68% {
          opacity: 0;
          transform: translateX(-50%) translateY(10px) scale(0.92) rotate(-90deg);
        }

        78%, 91% {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1) rotate(-90deg);
        }

        100% {
          opacity: 0;
          transform: translateX(-50%) translateY(-6px) scale(0.96) rotate(-90deg);
        }
      }
    }
  </style>
</head>

<body>
  <div class="transfer-wrap">
    <div class="transfer-card from-card">
      <div class="card-label">출금 계좌</div>
      <div class="bank-name">청송 사과은행</div>
      <div class="account">110-042-****-9821</div>
      <div class="amount">- ₩120,000</div>
    </div>

    <div class="transfer-road">
      <div class="road-line"></div>

      <div class="money-packet">
        <span>₩</span>
      </div>

      <span class="coin c1">₩</span>
      <span class="coin c2">₩</span>
      <span class="coin c3">₩</span>

      <div class="transfer-status">
        <span class="check"></span>
        이체 완료
      </div>
    </div>

    <div class="transfer-card to-card">
      <div class="card-label">입금 계좌</div>
      <div class="bank-name">묘캣 농장금고</div>
      <div class="account">302-777-****-1004</div>
      <div class="amount plus">+ ₩120,000</div>
    </div>
  </div>
</body>
</html>`;

export const ANIMATION_LAB_BREAKER_SWITCH_HTML = "<!DOCTYPE html>\r\n<html lang=\"ko\">\r\n<head>\r\n  <meta charset=\"UTF-8\" />\r\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\r\n  <title>가정용 분전반 CSS 애니메이션</title>\r\n  <style>\r\n    :root {\r\n      --panel-w: min(980px, 94vw);\r\n      --metal-1: #dfe3e6;\r\n      --metal-2: #bfc6cb;\r\n      --metal-3: #8d969d;\r\n      --ink: #171b1e;\r\n      --muted: #646d73;\r\n      --green: #4fd68a;\r\n      --green-soft: rgba(79, 214, 138, .26);\r\n      --red: #ff625e;\r\n      --red-soft: rgba(255, 98, 94, .22);\r\n      --amber: #ffc857;\r\n      --electric: #77ddff;\r\n      --shadow: 0 28px 70px rgba(0, 0, 0, .45);\r\n    }\r\n\r\n    * {\r\n      box-sizing: border-box;\r\n    }\r\n\r\n    html,\r\n    body {\r\n      min-height: 100%;\r\n    }\r\n\r\n    body {\r\n      margin: 0;\r\n      display: grid;\r\n      place-items: center;\r\n      overflow-x: hidden;\r\n      color: var(--ink);\r\n      font-family:\r\n        Pretendard, \"Noto Sans KR\", \"Apple SD Gothic Neo\",\r\n        system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\r\n      background:\r\n        radial-gradient(circle at 50% 0%, rgba(82, 115, 138, .28), transparent 34%),\r\n        linear-gradient(145deg, #0d1114 0%, #161d22 52%, #090c0f 100%);\r\n      padding: 32px 12px;\r\n    }\r\n\r\n    /* 실제 상태를 보관하는 체크박스: 화면에서는 숨김 */\r\n    .state-input {\r\n      position: fixed;\r\n      left: -9999px;\r\n      opacity: 0;\r\n      pointer-events: none;\r\n    }\r\n\r\n    .scene {\r\n      position: relative;\r\n      width: var(--panel-w);\r\n      perspective: 1400px;\r\n    }\r\n\r\n    .panel {\r\n      position: relative;\r\n      width: 100%;\r\n      isolation: isolate;\r\n      border: 1px solid #6f777d;\r\n      border-radius: 24px;\r\n      padding: 18px;\r\n      overflow: hidden;\r\n      background:\r\n        linear-gradient(110deg, rgba(255,255,255,.42), transparent 19%, rgba(255,255,255,.14) 38%, transparent 62%),\r\n        repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, rgba(0,0,0,.025) 1px 3px),\r\n        linear-gradient(145deg, var(--metal-1), var(--metal-2) 54%, #a6afb5);\r\n      box-shadow:\r\n        var(--shadow),\r\n        inset 0 1px 0 rgba(255,255,255,.9),\r\n        inset 0 -2px 5px rgba(0,0,0,.16);\r\n      transform: rotateX(1.2deg);\r\n      transition:\r\n        filter .45s ease,\r\n        box-shadow .45s ease;\r\n    }\r\n\r\n    .panel::before {\r\n      content: \"\";\r\n      position: absolute;\r\n      inset: 8px;\r\n      z-index: -1;\r\n      border-radius: 18px;\r\n      border: 1px solid rgba(45, 53, 58, .45);\r\n      box-shadow:\r\n        inset 0 0 0 1px rgba(255,255,255,.4),\r\n        inset 0 0 24px rgba(0,0,0,.08);\r\n      pointer-events: none;\r\n    }\r\n\r\n    .panel::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      inset: 0;\r\n      z-index: 20;\r\n      opacity: .18;\r\n      mix-blend-mode: overlay;\r\n      pointer-events: none;\r\n      background-image:\r\n        radial-gradient(circle at 15% 30%, #fff 0 .7px, transparent .8px),\r\n        radial-gradient(circle at 75% 60%, #000 0 .55px, transparent .65px);\r\n      background-size: 9px 9px, 13px 13px;\r\n    }\r\n\r\n    .screw {\r\n      position: absolute;\r\n      z-index: 25;\r\n      width: 15px;\r\n      aspect-ratio: 1;\r\n      border-radius: 50%;\r\n      background:\r\n        linear-gradient(45deg, transparent 44%, #4e565c 45% 54%, transparent 55%),\r\n        radial-gradient(circle at 35% 30%, #f5f7f8, #899198 55%, #535b61 100%);\r\n      box-shadow:\r\n        0 1px 2px rgba(0,0,0,.55),\r\n        inset 0 1px 1px rgba(255,255,255,.75);\r\n    }\r\n\r\n    .screw.tl { top: 25px; left: 25px; }\r\n    .screw.tr { top: 25px; right: 25px; transform: rotate(90deg); }\r\n    .screw.bl { bottom: 25px; left: 25px; transform: rotate(120deg); }\r\n    .screw.br { bottom: 25px; right: 25px; transform: rotate(25deg); }\r\n\r\n    .panel-header {\r\n      display: grid;\r\n      grid-template-columns: 1fr auto;\r\n      align-items: center;\r\n      gap: 20px;\r\n      min-height: 86px;\r\n      margin: 8px 8px 16px;\r\n      padding: 13px 26px;\r\n      border-radius: 14px;\r\n      color: #eaf5fb;\r\n      background:\r\n        linear-gradient(180deg, rgba(255,255,255,.05), transparent),\r\n        linear-gradient(135deg, #1d2429, #101518 72%);\r\n      box-shadow:\r\n        inset 0 0 0 1px rgba(255,255,255,.09),\r\n        inset 0 -8px 18px rgba(0,0,0,.22),\r\n        0 5px 12px rgba(0,0,0,.24);\r\n    }\r\n\r\n    .brand-line {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 14px;\r\n    }\r\n\r\n    .brand-mark {\r\n      display: grid;\r\n      place-items: center;\r\n      width: 42px;\r\n      aspect-ratio: 1;\r\n      border: 1px solid rgba(255,255,255,.18);\r\n      border-radius: 11px;\r\n      font-weight: 900;\r\n      letter-spacing: -.06em;\r\n      color: #c6f7ff;\r\n      background:\r\n        linear-gradient(145deg, #24343d, #0f1519);\r\n      box-shadow:\r\n        inset 0 1px 0 rgba(255,255,255,.12),\r\n        0 4px 8px rgba(0,0,0,.35);\r\n    }\r\n\r\n    .panel-title {\r\n      margin: 0;\r\n      font-size: clamp(18px, 2.5vw, 25px);\r\n      letter-spacing: -.045em;\r\n      line-height: 1.1;\r\n    }\r\n\r\n    .panel-subtitle {\r\n      margin: 6px 0 0;\r\n      color: #91a0a9;\r\n      font-size: 12px;\r\n      letter-spacing: .08em;\r\n    }\r\n\r\n    .meter-bank {\r\n      display: flex;\r\n      align-items: stretch;\r\n      gap: 8px;\r\n    }\r\n\r\n    .meter {\r\n      position: relative;\r\n      min-width: 105px;\r\n      padding: 10px 12px 9px;\r\n      overflow: hidden;\r\n      border: 1px solid #030708;\r\n      border-radius: 8px;\r\n      color: #9bf7c2;\r\n      text-align: right;\r\n      background:\r\n        repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px),\r\n        #07100c;\r\n      box-shadow:\r\n        inset 0 0 12px rgba(0,0,0,.85),\r\n        0 0 0 1px rgba(255,255,255,.04);\r\n    }\r\n\r\n    .meter::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      inset: 0;\r\n      pointer-events: none;\r\n      background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,.08) 42%, transparent 57%);\r\n    }\r\n\r\n    .meter-label {\r\n      display: block;\r\n      margin-bottom: 4px;\r\n      color: #52735f;\r\n      font-size: 9px;\r\n      font-weight: 800;\r\n      letter-spacing: .16em;\r\n      text-align: left;\r\n    }\r\n\r\n    .meter-value {\r\n      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r\n      font-size: 17px;\r\n      font-weight: 800;\r\n      letter-spacing: .02em;\r\n      text-shadow: 0 0 9px rgba(93, 255, 158, .48);\r\n    }\r\n\r\n    .meter-voltage .meter-value::before { content: \"220\"; }\r\n    .meter-load .meter-value::before { content: \"3.8\"; }\r\n\r\n    .meter-unit {\r\n      margin-left: 3px;\r\n      color: #58936e;\r\n      font-size: 10px;\r\n      font-weight: 800;\r\n    }\r\n\r\n    .cabinet {\r\n      position: relative;\r\n      display: grid;\r\n      grid-template-columns: minmax(210px, .82fr) 34px minmax(0, 2.2fr);\r\n      gap: 14px;\r\n      min-height: 480px;\r\n      margin: 0 8px 8px;\r\n      padding: 24px;\r\n      border: 1px solid #6c7479;\r\n      border-radius: 16px;\r\n      background:\r\n        linear-gradient(90deg, rgba(255,255,255,.32), transparent 14%, transparent 86%, rgba(0,0,0,.1)),\r\n        linear-gradient(180deg, #cbd1d5, #b5bdc2);\r\n      box-shadow:\r\n        inset 0 3px 9px rgba(0,0,0,.22),\r\n        inset 0 0 0 1px rgba(255,255,255,.6),\r\n        0 4px 10px rgba(0,0,0,.2);\r\n    }\r\n\r\n    .cabinet::before,\r\n    .cabinet::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      left: 23px;\r\n      right: 23px;\r\n      height: 8px;\r\n      border-radius: 99px;\r\n      background: linear-gradient(180deg, #818a91, #e7eaec 45%, #788087);\r\n      box-shadow:\r\n        inset 0 1px 1px rgba(255,255,255,.8),\r\n        0 2px 4px rgba(0,0,0,.2);\r\n    }\r\n\r\n    .cabinet::before { top: 13px; }\r\n    .cabinet::after { bottom: 13px; }\r\n\r\n    .main-zone,\r\n    .branch-zone {\r\n      position: relative;\r\n      z-index: 2;\r\n      border: 1px solid rgba(60, 67, 72, .34);\r\n      border-radius: 12px;\r\n      padding: 16px;\r\n      background:\r\n        linear-gradient(145deg, rgba(255,255,255,.38), rgba(255,255,255,.08)),\r\n        #aeb6bb;\r\n      box-shadow:\r\n        inset 0 1px 2px rgba(255,255,255,.78),\r\n        inset 0 -3px 8px rgba(0,0,0,.12);\r\n    }\r\n\r\n    .zone-label {\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: space-between;\r\n      margin: 0 1px 14px;\r\n      color: #5e676d;\r\n      font-size: 10px;\r\n      font-weight: 900;\r\n      letter-spacing: .13em;\r\n    }\r\n\r\n    .zone-label span:last-child {\r\n      color: #788188;\r\n      letter-spacing: .04em;\r\n    }\r\n\r\n    .main-breaker {\r\n      position: relative;\r\n      min-height: 322px;\r\n      border: 1px solid #575f64;\r\n      border-radius: 10px;\r\n      overflow: hidden;\r\n      color: #e9eef1;\r\n      background:\r\n        linear-gradient(90deg, rgba(255,255,255,.06), transparent 18%, transparent 82%, rgba(0,0,0,.24)),\r\n        linear-gradient(180deg, #2a3034, #14191c 73%, #0c1012);\r\n      box-shadow:\r\n        0 8px 14px rgba(0,0,0,.27),\r\n        inset 0 1px 0 rgba(255,255,255,.13),\r\n        inset 0 -8px 14px rgba(0,0,0,.34);\r\n    }\r\n\r\n    .main-breaker::before,\r\n    .mini-breaker::before {\r\n      content: \"\";\r\n      position: absolute;\r\n      left: 9%;\r\n      right: 9%;\r\n      top: 34px;\r\n      height: 2px;\r\n      background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);\r\n    }\r\n\r\n    .breaker-brand {\r\n      position: absolute;\r\n      top: 13px;\r\n      left: 15px;\r\n      font-size: 12px;\r\n      font-weight: 950;\r\n      letter-spacing: .12em;\r\n    }\r\n\r\n    .breaker-model {\r\n      position: absolute;\r\n      top: 15px;\r\n      right: 14px;\r\n      color: #9ba5ab;\r\n      font-size: 8px;\r\n      font-weight: 800;\r\n      letter-spacing: .1em;\r\n    }\r\n\r\n    .specs {\r\n      position: absolute;\r\n      top: 47px;\r\n      left: 15px;\r\n      right: 15px;\r\n      display: grid;\r\n      grid-template-columns: 1fr auto;\r\n      gap: 7px 10px;\r\n      color: #a8b1b6;\r\n      font-size: 9px;\r\n      line-height: 1.15;\r\n    }\r\n\r\n    .specs b {\r\n      color: #edf2f4;\r\n      font-size: 10px;\r\n    }\r\n\r\n    .main-lever-label {\r\n      position: absolute;\r\n      inset: 99px 29px 58px;\r\n      display: block;\r\n      cursor: pointer;\r\n      user-select: none;\r\n      -webkit-tap-highlight-color: transparent;\r\n    }\r\n\r\n    .lever-well {\r\n      position: absolute;\r\n      inset: 0;\r\n      border: 1px solid #07090a;\r\n      border-radius: 10px;\r\n      background:\r\n        linear-gradient(90deg, rgba(255,255,255,.04), transparent 22%, transparent 78%, rgba(0,0,0,.27)),\r\n        #080b0d;\r\n      box-shadow:\r\n        inset 0 10px 16px rgba(0,0,0,.8),\r\n        inset 0 -5px 8px rgba(255,255,255,.035),\r\n        0 1px 0 rgba(255,255,255,.07);\r\n    }\r\n\r\n    .state-mark {\r\n      position: absolute;\r\n      right: -19px;\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 6px;\r\n      font-size: 9px;\r\n      font-weight: 950;\r\n      letter-spacing: .08em;\r\n    }\r\n\r\n    .state-mark::before {\r\n      content: \"\";\r\n      width: 5px;\r\n      height: 5px;\r\n      border-radius: 50%;\r\n      background: currentColor;\r\n      box-shadow: 0 0 7px currentColor;\r\n    }\r\n\r\n    .state-mark.on {\r\n      top: 17px;\r\n      color: var(--green);\r\n    }\r\n\r\n    .state-mark.off {\r\n      bottom: 17px;\r\n      color: var(--red);\r\n    }\r\n\r\n    .main-lever {\r\n      position: absolute;\r\n      left: 13px;\r\n      right: 13px;\r\n      top: 50%;\r\n      height: 70px;\r\n      border: 1px solid #101416;\r\n      border-radius: 8px;\r\n      background:\r\n        linear-gradient(180deg, rgba(255,255,255,.2), transparent 12%, transparent 58%, rgba(0,0,0,.3)),\r\n        linear-gradient(90deg, #697178, #353b3f 18%, #495056 50%, #2c3135 82%, #646c72);\r\n      box-shadow:\r\n        0 9px 11px rgba(0,0,0,.54),\r\n        inset 0 1px 0 rgba(255,255,255,.34),\r\n        inset 0 -4px 7px rgba(0,0,0,.34);\r\n      transform: translateY(18px);\r\n      transform-origin: center;\r\n      transition:\r\n        transform .42s cubic-bezier(.2, 1.55, .32, 1),\r\n        box-shadow .3s ease,\r\n        filter .3s ease;\r\n    }\r\n\r\n    .main-lever::before {\r\n      content: \"\";\r\n      position: absolute;\r\n      inset: 11px 17px;\r\n      border-radius: 4px;\r\n      background:\r\n        repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, rgba(255,255,255,.035) 2px 5px),\r\n        linear-gradient(180deg, #32383c, #596167);\r\n      box-shadow:\r\n        inset 0 2px 4px rgba(0,0,0,.6),\r\n        0 1px 0 rgba(255,255,255,.1);\r\n    }\r\n\r\n    .main-lever::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      left: 50%;\r\n      bottom: 7px;\r\n      width: 38px;\r\n      height: 3px;\r\n      border-radius: 9px;\r\n      background: rgba(255,255,255,.22);\r\n      transform: translateX(-50%);\r\n    }\r\n\r\n    .test-button {\r\n      position: absolute;\r\n      left: 17px;\r\n      bottom: 15px;\r\n      width: 27px;\r\n      aspect-ratio: 1;\r\n      display: grid;\r\n      place-items: center;\r\n      border: 1px solid #24282b;\r\n      border-radius: 50%;\r\n      color: #5f3b00;\r\n      font-size: 8px;\r\n      font-weight: 950;\r\n      background:\r\n        radial-gradient(circle at 35% 27%, #ffe297, #e0a51b 55%, #8c5d00 100%);\r\n      box-shadow:\r\n        0 2px 3px rgba(0,0,0,.5),\r\n        inset 0 1px 1px rgba(255,255,255,.66);\r\n    }\r\n\r\n    .main-rating {\r\n      position: absolute;\r\n      right: 15px;\r\n      bottom: 18px;\r\n      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;\r\n      font-size: 17px;\r\n      font-weight: 900;\r\n    }\r\n\r\n    .main-status-row {\r\n      display: grid;\r\n      grid-template-columns: auto 1fr;\r\n      align-items: center;\r\n      gap: 10px;\r\n      margin-top: 13px;\r\n      min-height: 45px;\r\n      padding: 9px 11px;\r\n      border: 1px solid rgba(0,0,0,.2);\r\n      border-radius: 8px;\r\n      background: rgba(238, 242, 244, .44);\r\n      box-shadow: inset 0 1px 2px rgba(255,255,255,.6);\r\n    }\r\n\r\n    .status-lamp {\r\n      width: 15px;\r\n      aspect-ratio: 1;\r\n      border: 2px solid #576066;\r\n      border-radius: 50%;\r\n      background: #4b5256;\r\n      box-shadow:\r\n        inset 0 1px 2px rgba(0,0,0,.6),\r\n        0 0 0 2px rgba(255,255,255,.35);\r\n      transition:\r\n        background .3s ease,\r\n        box-shadow .3s ease;\r\n    }\r\n\r\n    .main-status::before {\r\n      content: \"주 차단됨\";\r\n      display: block;\r\n      color: #5b6368;\r\n      font-size: 11px;\r\n      font-weight: 900;\r\n    }\r\n\r\n    .main-status::after {\r\n      content: \"하위 회로 전원 없음\";\r\n      display: block;\r\n      margin-top: 2px;\r\n      color: #848c91;\r\n      font-size: 9px;\r\n    }\r\n\r\n    /* 중앙 전력 버스 */\r\n    .bus {\r\n      position: relative;\r\n      z-index: 2;\r\n      margin: 27px 0;\r\n      border-radius: 8px;\r\n      background:\r\n        linear-gradient(90deg, #784f18, #d5a245 28%, #f1ca72 50%, #ae7426 78%, #68400f);\r\n      box-shadow:\r\n        inset 0 1px 1px rgba(255,255,255,.52),\r\n        inset 0 -2px 3px rgba(74,43,3,.5),\r\n        0 3px 7px rgba(0,0,0,.25);\r\n    }\r\n\r\n    .bus::before {\r\n      content: \"\";\r\n      position: absolute;\r\n      inset: 6px 8px;\r\n      border-radius: 6px;\r\n      background:\r\n        repeating-linear-gradient(\r\n          180deg,\r\n          rgba(255,255,255,.22) 0 8px,\r\n          rgba(71,42,7,.22) 8px 10px\r\n        );\r\n    }\r\n\r\n    .bus-flow {\r\n      position: absolute;\r\n      inset: 5px 7px;\r\n      overflow: hidden;\r\n      border-radius: 6px;\r\n      opacity: .9;\r\n      transition: opacity .35s ease;\r\n    }\r\n\r\n    .bus-flow::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      top: -45%;\r\n      left: 50%;\r\n      width: 7px;\r\n      height: 65px;\r\n      border-radius: 50%;\r\n      background: #e9fbff;\r\n      box-shadow:\r\n        0 0 7px 2px var(--electric),\r\n        0 0 18px 5px rgba(119, 221, 255, .62);\r\n      transform: translateX(-50%);\r\n      animation: currentDrop 1.35s linear infinite;\r\n    }\r\n\r\n    @keyframes currentDrop {\r\n      from { top: -70px; }\r\n      to { top: calc(100% + 25px); }\r\n    }\r\n\r\n    .branch-zone {\r\n      display: flex;\r\n      flex-direction: column;\r\n      min-width: 0;\r\n    }\r\n\r\n    .branch-grid {\r\n      display: grid;\r\n      grid-template-columns: repeat(4, minmax(86px, 1fr));\r\n      gap: 13px 10px;\r\n      flex: 1;\r\n    }\r\n\r\n    .branch-item {\r\n      position: relative;\r\n      min-width: 0;\r\n    }\r\n\r\n    .branch-input {\r\n      position: absolute;\r\n      opacity: 0;\r\n      pointer-events: none;\r\n    }\r\n\r\n    .mini-breaker {\r\n      position: relative;\r\n      display: block;\r\n      height: 174px;\r\n      overflow: hidden;\r\n      border: 1px solid #656d72;\r\n      border-radius: 8px;\r\n      cursor: pointer;\r\n      user-select: none;\r\n      -webkit-tap-highlight-color: transparent;\r\n      color: #202529;\r\n      background:\r\n        linear-gradient(90deg, rgba(255,255,255,.62), transparent 16%, transparent 84%, rgba(0,0,0,.11)),\r\n        linear-gradient(180deg, #f1f3f4, #cdd2d5);\r\n      box-shadow:\r\n        0 5px 8px rgba(0,0,0,.22),\r\n        inset 0 1px 0 #fff,\r\n        inset 0 -4px 7px rgba(0,0,0,.1);\r\n      transition:\r\n        transform .18s ease,\r\n        filter .25s ease,\r\n        box-shadow .25s ease;\r\n    }\r\n\r\n    .mini-breaker:hover {\r\n      transform: translateY(-2px);\r\n      box-shadow:\r\n        0 8px 12px rgba(0,0,0,.25),\r\n        inset 0 1px 0 #fff,\r\n        inset 0 -4px 7px rgba(0,0,0,.1);\r\n    }\r\n\r\n    .mini-breaker:active {\r\n      transform: translateY(0) scale(.985);\r\n    }\r\n\r\n    .mini-brand {\r\n      position: absolute;\r\n      top: 10px;\r\n      left: 10px;\r\n      font-size: 8px;\r\n      font-weight: 950;\r\n      letter-spacing: .08em;\r\n    }\r\n\r\n    .mini-pole {\r\n      position: absolute;\r\n      top: 11px;\r\n      right: 8px;\r\n      color: #7b8388;\r\n      font-size: 7px;\r\n      font-weight: 850;\r\n    }\r\n\r\n    .mini-led {\r\n      position: absolute;\r\n      top: 32px;\r\n      right: 10px;\r\n      width: 7px;\r\n      aspect-ratio: 1;\r\n      border: 1px solid #545b60;\r\n      border-radius: 50%;\r\n      background: #646a6e;\r\n      box-shadow: inset 0 1px 2px rgba(0,0,0,.55);\r\n      transition:\r\n        background .25s ease,\r\n        box-shadow .25s ease;\r\n    }\r\n\r\n    .mini-rating {\r\n      position: absolute;\r\n      top: 32px;\r\n      left: 10px;\r\n      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;\r\n      font-size: 14px;\r\n      font-weight: 950;\r\n    }\r\n\r\n    .mini-track {\r\n      position: absolute;\r\n      top: 57px;\r\n      left: 12px;\r\n      right: 12px;\r\n      height: 69px;\r\n      border: 1px solid #868e93;\r\n      border-radius: 6px;\r\n      background:\r\n        linear-gradient(180deg, rgba(255,255,255,.5), transparent 18%),\r\n        #9da5aa;\r\n      box-shadow:\r\n        inset 0 5px 8px rgba(0,0,0,.22),\r\n        inset 0 -2px 4px rgba(255,255,255,.6);\r\n    }\r\n\r\n    .mini-track::before,\r\n    .mini-track::after {\r\n      position: absolute;\r\n      right: 4px;\r\n      font-size: 6px;\r\n      font-weight: 950;\r\n      letter-spacing: .04em;\r\n    }\r\n\r\n    .mini-track::before {\r\n      content: \"I · ON\";\r\n      top: 3px;\r\n      color: #226f46;\r\n    }\r\n\r\n    .mini-track::after {\r\n      content: \"O · OFF\";\r\n      bottom: 3px;\r\n      color: #8b3432;\r\n    }\r\n\r\n    .mini-handle {\r\n      position: absolute;\r\n      left: 7px;\r\n      right: 7px;\r\n      top: 50%;\r\n      height: 31px;\r\n      border: 1px solid #3c4347;\r\n      border-radius: 5px;\r\n      background:\r\n        linear-gradient(180deg, rgba(255,255,255,.27), transparent 20%, rgba(0,0,0,.18)),\r\n        linear-gradient(90deg, #4d555a, #7b848a 48%, #434b50);\r\n      box-shadow:\r\n        0 5px 6px rgba(0,0,0,.35),\r\n        inset 0 1px 0 rgba(255,255,255,.45);\r\n      transform: translateY(8px);\r\n      transition:\r\n        transform .38s cubic-bezier(.18, 1.65, .35, 1),\r\n        filter .25s ease,\r\n        box-shadow .25s ease;\r\n    }\r\n\r\n    .mini-handle::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      left: 8px;\r\n      right: 8px;\r\n      top: 8px;\r\n      height: 8px;\r\n      border-radius: 3px;\r\n      background: repeating-linear-gradient(90deg, #333b40 0 2px, #626b70 2px 4px);\r\n      box-shadow: inset 0 1px 2px rgba(0,0,0,.45);\r\n    }\r\n\r\n    .circuit-name {\r\n      position: absolute;\r\n      left: 8px;\r\n      right: 8px;\r\n      bottom: 9px;\r\n      min-height: 28px;\r\n      display: grid;\r\n      place-items: center;\r\n      padding: 5px 3px;\r\n      border: 1px solid #9ea5aa;\r\n      border-radius: 4px;\r\n      color: #2c3337;\r\n      text-align: center;\r\n      font-size: 9px;\r\n      font-weight: 900;\r\n      line-height: 1.25;\r\n      background: rgba(255,255,255,.58);\r\n      box-shadow: inset 0 1px 1px rgba(255,255,255,.9);\r\n    }\r\n\r\n    .branch-input:focus-visible + .mini-breaker,\r\n    .main-state:focus-visible ~ .scene .main-lever-label {\r\n      outline: 3px solid rgba(93, 194, 255, .75);\r\n      outline-offset: 3px;\r\n    }\r\n\r\n    /* 개별 분기 차단기 ON */\r\n    .branch-input:checked + .mini-breaker .mini-handle {\r\n      transform: translateY(-23px);\r\n      box-shadow:\r\n        0 7px 7px rgba(0,0,0,.4),\r\n        0 0 12px rgba(79, 214, 138, .12),\r\n        inset 0 1px 0 rgba(255,255,255,.45);\r\n    }\r\n\r\n    .branch-input:checked + .mini-breaker .mini-led {\r\n      background: var(--green);\r\n      box-shadow:\r\n        0 0 6px 2px var(--green-soft),\r\n        inset 0 1px 1px rgba(255,255,255,.65);\r\n      animation: ledBreath 2.2s ease-in-out infinite;\r\n    }\r\n\r\n    .branch-input:not(:checked) + .mini-breaker {\r\n      filter: saturate(.7) brightness(.93);\r\n    }\r\n\r\n    .branch-input:not(:checked) + .mini-breaker .mini-led {\r\n      background: var(--red);\r\n      box-shadow: 0 0 5px var(--red-soft);\r\n    }\r\n\r\n    @keyframes ledBreath {\r\n      0%, 100% { filter: brightness(.84); }\r\n      50% { filter: brightness(1.35); }\r\n    }\r\n\r\n    .panel-footer {\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: space-between;\r\n      gap: 14px;\r\n      margin: 13px 13px 2px;\r\n      color: #60686e;\r\n      font-size: 10px;\r\n      font-weight: 750;\r\n    }\r\n\r\n    .hint {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 7px;\r\n    }\r\n\r\n    .hint::before {\r\n      content: \"\";\r\n      width: 8px;\r\n      aspect-ratio: 1;\r\n      border-radius: 50%;\r\n      background: #657078;\r\n      box-shadow: inset 0 1px 1px rgba(255,255,255,.5);\r\n    }\r\n\r\n    .safety {\r\n      display: inline-flex;\r\n      align-items: center;\r\n      gap: 6px;\r\n      color: #7a5a16;\r\n    }\r\n\r\n    .safety::before {\r\n      content: \"⚠\";\r\n      font-size: 12px;\r\n    }\r\n\r\n    /* 메인 차단기 ON 상태 */\r\n    .main-state:checked ~ .scene .main-lever {\r\n      transform: translateY(-52px);\r\n      box-shadow:\r\n        0 12px 12px rgba(0,0,0,.55),\r\n        0 0 18px rgba(79,214,138,.13),\r\n        inset 0 1px 0 rgba(255,255,255,.34),\r\n        inset 0 -4px 7px rgba(0,0,0,.34);\r\n    }\r\n\r\n    .main-state:checked ~ .scene .status-lamp {\r\n      background: var(--green);\r\n      box-shadow:\r\n        0 0 8px 3px var(--green-soft),\r\n        inset 0 1px 1px rgba(255,255,255,.7),\r\n        0 0 0 2px rgba(255,255,255,.35);\r\n      animation: ledBreath 2s ease-in-out infinite;\r\n    }\r\n\r\n    .main-state:checked ~ .scene .main-status::before {\r\n      content: \"전원 공급 중\";\r\n      color: #23794a;\r\n    }\r\n\r\n    .main-state:checked ~ .scene .main-status::after {\r\n      content: \"AC 220 V · 정상\";\r\n      color: #54836a;\r\n    }\r\n\r\n    /* 메인 OFF 상태 */\r\n    .main-state:not(:checked) ~ .scene .panel {\r\n      filter: saturate(.74) brightness(.93);\r\n      box-shadow:\r\n        0 28px 70px rgba(0, 0, 0, .46),\r\n        inset 0 1px 0 rgba(255,255,255,.78),\r\n        inset 0 -2px 5px rgba(0,0,0,.18);\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .meter {\r\n      color: #6d4543;\r\n      background: #100807;\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .meter-label {\r\n      color: #714541;\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .meter-voltage .meter-value::before {\r\n      content: \"000\";\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .meter-load .meter-value::before {\r\n      content: \"0.0\";\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .meter-value {\r\n      color: #c56a64;\r\n      text-shadow: 0 0 8px rgba(255,98,94,.25);\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .meter-unit {\r\n      color: #7c4b48;\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .bus-flow {\r\n      opacity: .05;\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .bus-flow::after {\r\n      animation-play-state: paused;\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .branch-zone {\r\n      filter: brightness(.88) saturate(.55);\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .mini-led {\r\n      background: #555c60 !important;\r\n      box-shadow: inset 0 1px 2px rgba(0,0,0,.62) !important;\r\n      animation: none !important;\r\n    }\r\n\r\n    .main-state:not(:checked) ~ .scene .main-lever {\r\n      animation: tripShake .34s ease;\r\n    }\r\n\r\n    @keyframes tripShake {\r\n      0% { transform: translateY(18px) rotate(0deg); }\r\n      35% { transform: translateY(21px) rotate(-1.2deg); }\r\n      68% { transform: translateY(16px) rotate(.8deg); }\r\n      100% { transform: translateY(18px) rotate(0deg); }\r\n    }\r\n\r\n    /* 화면이 작을 때 */\r\n    @media (max-width: 760px) {\r\n      body {\r\n        padding: 14px 8px;\r\n      }\r\n\r\n      .panel {\r\n        padding: 12px;\r\n        border-radius: 18px;\r\n        transform: none;\r\n      }\r\n\r\n      .panel-header {\r\n        grid-template-columns: 1fr;\r\n        padding: 16px 18px;\r\n      }\r\n\r\n      .meter-bank {\r\n        width: 100%;\r\n      }\r\n\r\n      .meter {\r\n        flex: 1;\r\n        min-width: 0;\r\n      }\r\n\r\n      .cabinet {\r\n        grid-template-columns: 1fr;\r\n        padding: 18px;\r\n      }\r\n\r\n      .bus {\r\n        height: 24px;\r\n        margin: 0 24px;\r\n      }\r\n\r\n      .bus-flow::after {\r\n        top: 50%;\r\n        left: -60px;\r\n        width: 65px;\r\n        height: 7px;\r\n        transform: translateY(-50%);\r\n        animation: currentAcross 1.35s linear infinite;\r\n      }\r\n\r\n      @keyframes currentAcross {\r\n        from { left: -70px; }\r\n        to { left: calc(100% + 25px); }\r\n      }\r\n\r\n      .main-breaker {\r\n        min-height: 295px;\r\n      }\r\n\r\n      .main-lever-label {\r\n        inset: 92px 30px 55px;\r\n      }\r\n\r\n      .branch-grid {\r\n        grid-template-columns: repeat(2, minmax(96px, 1fr));\r\n      }\r\n\r\n      .panel-footer {\r\n        align-items: flex-start;\r\n        flex-direction: column;\r\n      }\r\n    }\r\n\r\n    @media (max-width: 390px) {\r\n      .brand-mark {\r\n        display: none;\r\n      }\r\n\r\n      .panel-header {\r\n        margin-inline: 4px;\r\n      }\r\n\r\n      .cabinet {\r\n        margin-inline: 4px;\r\n        padding: 15px;\r\n      }\r\n\r\n      .main-zone,\r\n      .branch-zone {\r\n        padding: 12px;\r\n      }\r\n\r\n      .branch-grid {\r\n        gap: 10px 8px;\r\n      }\r\n    }\r\n\r\n    @media (prefers-reduced-motion: reduce) {\r\n      *,\r\n      *::before,\r\n      *::after {\r\n        animation-duration: .001ms !important;\r\n        animation-iteration-count: 1 !important;\r\n        transition-duration: .001ms !important;\r\n      }\r\n    }\r\n  </style>\r\n</head>\r\n<body>\r\n  <!-- 체크 상태 자체가 전원 상태가 됩니다. JS 없이 작동합니다. -->\r\n  <input\r\n    class=\"state-input main-state\"\r\n    type=\"checkbox\"\r\n    id=\"mainPower\"\r\n    checked\r\n    aria-label=\"메인 차단기\"\r\n  />\r\n\r\n  <main class=\"scene\">\r\n    <section class=\"panel\" aria-label=\"가정용 분전반 인터랙션\">\r\n      <i class=\"screw tl\" aria-hidden=\"true\"></i>\r\n      <i class=\"screw tr\" aria-hidden=\"true\"></i>\r\n      <i class=\"screw bl\" aria-hidden=\"true\"></i>\r\n      <i class=\"screw br\" aria-hidden=\"true\"></i>\r\n\r\n      <header class=\"panel-header\">\r\n        <div class=\"brand-line\">\r\n          <div class=\"brand-mark\" aria-hidden=\"true\">JB</div>\r\n          <div>\r\n            <h1 class=\"panel-title\">가정용 분전반</h1>\r\n            <p class=\"panel-subtitle\">RESIDENTIAL DISTRIBUTION BOARD · 220 V / 60 Hz</p>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"meter-bank\" aria-label=\"전력 계측 표시\">\r\n          <div class=\"meter meter-voltage\">\r\n            <span class=\"meter-label\">VOLTAGE</span>\r\n            <span class=\"meter-value\"></span><span class=\"meter-unit\">V</span>\r\n          </div>\r\n          <div class=\"meter meter-load\">\r\n            <span class=\"meter-label\">CURRENT LOAD</span>\r\n            <span class=\"meter-value\"></span><span class=\"meter-unit\">kW</span>\r\n          </div>\r\n        </div>\r\n      </header>\r\n\r\n      <div class=\"cabinet\">\r\n        <section class=\"main-zone\">\r\n          <div class=\"zone-label\">\r\n            <span>MAIN BREAKER</span>\r\n            <span>누전 차단기</span>\r\n          </div>\r\n\r\n          <article class=\"main-breaker\">\r\n            <div class=\"breaker-brand\">JUNBO ELECTRIC</div>\r\n            <div class=\"breaker-model\">JBE-2P · RCCB</div>\r\n\r\n            <div class=\"specs\">\r\n              <span>정격 전압</span><b>AC 220 V</b>\r\n              <span>정격 감도 전류</span><b>30 mA</b>\r\n              <span>차단 시간</span><b>≤ 0.03 s</b>\r\n            </div>\r\n\r\n            <label class=\"main-lever-label\" for=\"mainPower\" title=\"메인 차단기 전환\">\r\n              <span class=\"lever-well\"></span>\r\n              <span class=\"state-mark on\">ON</span>\r\n              <span class=\"state-mark off\">OFF</span>\r\n              <span class=\"main-lever\"></span>\r\n            </label>\r\n\r\n            <span class=\"test-button\" title=\"장식용 테스트 버튼\">T</span>\r\n            <span class=\"main-rating\">50A</span>\r\n          </article>\r\n\r\n          <div class=\"main-status-row\" aria-live=\"polite\">\r\n            <span class=\"status-lamp\" aria-hidden=\"true\"></span>\r\n            <span class=\"main-status\"></span>\r\n          </div>\r\n        </section>\r\n\r\n        <div class=\"bus\" aria-hidden=\"true\">\r\n          <span class=\"bus-flow\"></span>\r\n        </div>\r\n\r\n        <section class=\"branch-zone\">\r\n          <div class=\"zone-label\">\r\n            <span>BRANCH CIRCUITS</span>\r\n            <span>분기 회로 · 개별 클릭</span>\r\n          </div>\r\n\r\n          <div class=\"branch-grid\">\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit1\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit1\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C16</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">거실 조명</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit2\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit2\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C20</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">일반 콘센트</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit3\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit3\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C20</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">주방 전열</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit4\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit4\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C20</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">냉장고</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit5\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit5\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C25</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">에어컨</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit6\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit6\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C20</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">보일러</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit7\" type=\"checkbox\" checked />\r\n              <label class=\"mini-breaker\" for=\"circuit7\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C16</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">실외 조명</span>\r\n              </label>\r\n            </div>\r\n\r\n            <div class=\"branch-item\">\r\n              <input class=\"branch-input\" id=\"circuit8\" type=\"checkbox\" />\r\n              <label class=\"mini-breaker\" for=\"circuit8\">\r\n                <span class=\"mini-brand\">JB</span>\r\n                <span class=\"mini-pole\">1P</span>\r\n                <span class=\"mini-rating\">C16</span>\r\n                <span class=\"mini-led\"></span>\r\n                <span class=\"mini-track\"><span class=\"mini-handle\"></span></span>\r\n                <span class=\"circuit-name\">예비 회로</span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n        </section>\r\n      </div>\r\n\r\n      <footer class=\"panel-footer\">\r\n        <span class=\"hint\">메인 레버 또는 각 분기 차단기를 클릭해 상태를 전환하세요.</span>\r\n        <span class=\"safety\">게임·웹 UI용 시각 표현</span>\r\n      </footer>\r\n    </section>\r\n  </main>\r\n</body>\r\n</html>";

export const ANIMATION_LAB_PRESET_OPTIONS = [
  { key: 'vehicleFuel', label: '차량연료통 애니메이션', html: ANIMATION_LAB_DEFAULT_HTML },
  { key: 'can', label: '말통 애니메이션', html: ANIMATION_LAB_CAN_HTML },
  { key: 'palletJack', label: '파레트 잭', html: ANIMATION_LAB_PALLET_JACK_HTML },
  { key: 'truckMove', label: '트럭 이동 애니메이션', html: ANIMATION_LAB_TRUCK_MOVE_HTML },
  { key: 'movingSilhouette', label: '이동중 실루엣 테스트', html: ANIMATION_LAB_MOVING_SILHOUETTE_HTML },
  { key: 'fruitCrate', label: '노란 과일상자 수확 애니메이션', html: ANIMATION_LAB_FRUIT_CRATE_HTML },
  { key: 'fruitCrateGreen', label: '초록 과일상자 수확 애니메이션', html: ANIMATION_LAB_FRUIT_CRATE_GREEN_HTML },
  { key: 'fruitCrateSequence', label: '노랑-초록 과일상자 순차 수확 애니메이션', html: ANIMATION_LAB_FRUIT_CRATE_SEQUENCE_HTML },
  { key: 'appleCrateFull', label: '사과상자', html: ANIMATION_LAB_APPLE_CRATE_FULL_HTML },
  { key: 'appleCratePacked', label: '노란 컨테이너 사과 가득참', html: ANIMATION_LAB_APPLE_CRATE_PACKED_HTML },
  { key: 'appleCrateGreenPacked', label: '초록 컨테이너 사과 가득참', html: ANIMATION_LAB_APPLE_CRATE_GREEN_PACKED_HTML },
  { key: 'transportCrateFlow', label: '운반 애니메이션 - 컨테이너 흐름', html: ANIMATION_LAB_TRANSPORT_CRATE_FLOW_HTML },
  { key: 'appleCrateOneThird', label: '노란 컨테이너 사과 잔량 1/3', html: ANIMATION_LAB_APPLE_CRATE_ONE_THIRD_HTML },
  { key: 'appleCrateGreenOneThird', label: '초록 컨테이너 사과 잔량 1/3', html: ANIMATION_LAB_APPLE_CRATE_GREEN_ONE_THIRD_HTML },
  { key: 'appleCrateTwoThirds', label: '노란 컨테이너 사과 잔량 2/3', html: ANIMATION_LAB_APPLE_CRATE_TWO_THIRDS_HTML },
  { key: 'appleCrateGreenTwoThirds', label: '초록 컨테이너 사과 잔량 2/3', html: ANIMATION_LAB_APPLE_CRATE_GREEN_TWO_THIRDS_HTML },
  { key: 'currentCan', label: '현재 말통 애니메이션', html: ANIMATION_LAB_CURRENT_CAN_HTML },
  { key: 'groundwater', label: '지하수 용량 애니메이션', html: ANIMATION_LAB_GROUNDWATER_HTML },
  { key: 'ssMix', label: 'SS기 배합 애니메이션', html: ANIMATION_LAB_SS_MIX_HTML },
  { key: 'sprayFan', label: '방제팬 애니메이션', html: ANIMATION_LAB_SPRAY_FAN_HTML },
  { key: 'sprayFanHood', label: '방제팬 애니메이션 (후드형)', html: ANIMATION_LAB_SPRAY_FAN_HOOD_HTML },
  { key: 'circleBurst', label: '원형 버스트 전환', html: ANIMATION_LAB_CIRCLE_BURST_HTML },
  { key: 'tvModal', label: 'TV 스타일 모달 전환', html: ANIMATION_LAB_TV_MODAL_HTML },
  { key: 'tvModalLight', label: 'TV 스타일 모달 전환 (밝은 버전)', html: ANIMATION_LAB_TV_MODAL_LIGHT_HTML },
  { key: 'tvModalGameTone', label: 'TV 스타일 모달 전환 (게임 톤)', html: ANIMATION_LAB_TV_MODAL_GAME_TONE_HTML },
  { key: 'dayToNight', label: '하루 넘김 - 밤 진입', html: ANIMATION_LAB_DAY_TO_NIGHT_HTML },
  { key: 'nextDayTransition', label: '하루 넘김 - 다음날 진행', html: ANIMATION_LAB_NEXT_DAY_HTML },
  { key: 'dayNightSlider', label: 'Day/Night 슬라이더 프리뷰', html: ANIMATION_LAB_DAY_NIGHT_SLIDER_HTML },
  { key: 'queueTicketPrinter', label: '번호표 출력 애니메이션', html: ANIMATION_LAB_QUEUE_TICKET_PRINTER_HTML },
  { key: 'appLongPress', label: '앱 아이콘 / 패널 꾹누름', html: ANIMATION_LAB_APP_LONG_PRESS_HTML },
  { key: 'industrialControlPanel', label: '농장/공장 제어패널 테스트', html: ANIMATION_LAB_INDUSTRIAL_CONTROL_PANEL_HTML },
  { key: 'breakerSwitchTest', label: '두꺼비집 스위치 테스트', html: ANIMATION_LAB_BREAKER_SWITCH_HTML, saveTarget: { type: 'inline', constName: 'ANIMATION_LAB_BREAKER_SWITCH_HTML' } },
  { key: 'cardPayment', label: '구버전 카드애니메이션', html: ANIMATION_LAB_CARD_PAYMENT_HTML_RAW },
  { key: 'cardPaymentNew', label: '신버전 카드결제 애니메이션', html: ANIMATION_LAB_CARD_PAYMENT_NEW_HTML_RAW },
  { key: 'bankTransfer', label: '계좌이체 애니메이션', html: ANIMATION_LAB_BANK_TRANSFER_HTML, saveTarget: { type: 'inline', constName: 'ANIMATION_LAB_BANK_TRANSFER_HTML' } },
  { key: 'cashPayment', label: '현금 결제 애니메이션', html: ANIMATION_LAB_CASH_PAYMENT_HTML },
  { key: 'currentFieldMap300', label: '현재토지 가상 지도 (300평)', html: ANIMATION_LAB_CURRENT_FIELD_MAP_300_HTML },
  { key: 'appleSorter', label: '선별기 애니메이션', html: ANIMATION_LAB_APPLE_SORTER_HTML },
  { key: 'appleStemRemoval', label: '사과 꼭지 제거작업', html: ANIMATION_LAB_APPLE_STEM_REMOVAL_HTML },
  { key: 'applePartialSort', label: '부분선별', html: ANIMATION_LAB_APPLE_PARTIAL_SORT_HTML }

,
  { key: 'dsa', label: '지게차', html: ANIMATION_LAB_DSA_HTML, saveTarget: { type: 'inline', constName: 'ANIMATION_LAB_DSA_HTML' } },

];
