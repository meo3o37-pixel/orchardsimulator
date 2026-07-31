import { useCallback, useEffect, useRef } from 'react';

import FARM_MENU_BUTTON_SOUND from '../../assets/images/효과음/UI/딸깍음1.mp3';
import UI_OPEN_SOUND from '../../assets/images/효과음/UI/UI 바로 열리는 소리.mp3';
import CHECKING_BUTTON_SOUND from '../../assets/images/효과음/UI/체킹 버튼음.mp3';
import SLOT_PICKER_OPEN_SOUND from '../../assets/images/효과음/UI/모달이 휙하고 뭔가 열리는소리2.mp3';
import PHONE_UNLOCK_SOUND from '../../assets/images/효과음/UI/핸드폰 잠금해제.mp3';
import PHONE_TAKE_OUT_SOUND from '../../assets/images/효과음/UI/핸드폰 꺼내는소리.mp3';
import PHONE_APP_TAP_SOUND from '../../assets/images/효과음/UI/모바일 앱 누를때 소리.mp3';
import MAP_OPEN_SOUND from '../../assets/images/효과음/UI/지도 열리는 사운드.mp3';
import DAY_TIME_TRANSITION_SOUND from '../../assets/images/효과음/UI/밤낮 애니메이션/낮시간애니메이션 사운드.mp3';
import NIGHT_TIME_TRANSITION_SOUND from '../../assets/images/효과음/UI/밤낮 애니메이션/밤시간애니메이션 사운드.mp3';
import SMALL_DOOR_OPEN_SOUND from '../../assets/images/효과음/시설/문소리/작은 문여는소리.mp3';
import SMALL_DOOR_OPEN_SOUND_2 from '../../assets/images/효과음/시설/문소리/작은 문여는소리2.mp3';
import SMALL_DOOR_CLOSE_SOUND from '../../assets/images/효과음/시설/문소리/작은 문닫는소리.mp3';
import SMALL_DOOR_CLOSE_SOUND_2 from '../../assets/images/효과음/시설/문소리/작은 문닫는소리2.mp3';
import LARGE_DOOR_OPEN_SOUND from '../../assets/images/효과음/시설/문소리/큰문여는소리.mp3';
import LARGE_DOOR_OPEN_SOUND_2 from '../../assets/images/효과음/시설/문소리/큰문여는소리2.mp3';
import LARGE_DOOR_OPEN_SOUND_3 from '../../assets/images/효과음/시설/문소리/큰문여는소리3.mp3';
import LARGE_DOOR_OPEN_SOUND_4 from '../../assets/images/효과음/시설/문소리/큰문여는소리4.mp3';
import LARGE_DOOR_CLOSE_SOUND from '../../assets/images/효과음/시설/문소리/큰문닫는소리.mp3';
import LARGE_DOOR_CLOSE_SOUND_2 from '../../assets/images/효과음/시설/문소리/큰문닫는소리2.mp3';
import LARGE_DOOR_CLOSE_SOUND_3 from '../../assets/images/효과음/시설/문소리/큰문닫는소리3.mp3';
import LARGE_DOOR_CLOSE_SOUND_4 from '../../assets/images/효과음/시설/문소리/큰문닫는소리4.mp3';
import CONTROL_PANEL_SWITCH_SOUND from '../../assets/images/효과음/전기/제어판 스위치.mp3';
import KEPCO_POWER_ON_SOUND from '../../assets/images/효과음/전기/한전 ON 사운드.mp3';
import KEPCO_POWER_OFF_SOUND from '../../assets/images/효과음/전기/한전 OFF 사운드.mp3';
import SHOP_BARCODE_SOUND from '../../assets/images/효과음/시설/상점사운드/바코드.mp3';

import SHOP_CARD_PAYMENT_SOUND from '../../assets/images/효과음/시설/상점사운드/카드결제사운드.mp3';
import SHOP_CARD_RECEIPT_SOUND_1 from '../../assets/images/효과음/시설/상점사운드/카드영수증1.mp3';
import SHOP_CARD_RECEIPT_SOUND_2 from '../../assets/images/효과음/시설/상점사운드/카드영수증2.mp3';
import SHOP_CARD_RECEIPT_SOUND_3 from '../../assets/images/효과음/시설/상점사운드/카드영수증3.mp3';

const createAudio = (src, volume) => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = volume;
  return audio;
};

const SHOP_BARCODE_VOLUME_RATIO = 0.22;
const SHOP_CARD_PAYMENT_VOLUME_RATIO = 0.72;
const SHOP_CARD_RECEIPT_VOLUME_RATIO = 0.58;

export const useGameSfx = (volume = 0.1) => {
  const volumeRef = useRef(volume);
  const menuButtonAudioRef = useRef(null);
  const uiOpenAudioRef = useRef(null);
  const checkingButtonAudioRef = useRef(null);
  const slotPickerAudioRef = useRef(null);
  const phoneUnlockAudioRef = useRef(null);
  const phoneTakeOutAudioRef = useRef(null);
  const phoneAppTapAudioRef = useRef(null);
  const mapOpenAudioRef = useRef(null);
  const dayTimeTransitionAudioRef = useRef(null);
  const nightTimeTransitionAudioRef = useRef(null);
  const timeTransitionFadeOutTimerRef = useRef(null);
  const smallDoorOpenAudioRefs = useRef([]);
  const smallDoorCloseAudioRefs = useRef([]);
  const largeDoorOpenAudioRefs = useRef([]);
  const largeDoorCloseAudioRefs = useRef([]);
  const controlPanelSwitchAudioRef = useRef(null);
  const kepcoPowerOnAudioRef = useRef(null);
  const kepcoPowerOffAudioRef = useRef(null);
  const shopBarcodeAudioRef = useRef(null);
  const shopCardPaymentAudioRef = useRef(null);
  const shopCardReceiptAudioRefs = useRef([]);

  const playAudio = useCallback((audio) => {
    if (!audio) return;
    audio.volume = volumeRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const playAudioWithVolumeRatio = useCallback((audio, ratio = 1) => {
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volumeRef.current * Math.max(0, Number(ratio) || 0)));
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const fadeAudioTo = useCallback((audio, targetVolume, durationMs, options = {}) => {
    if (!audio || typeof requestAnimationFrame === 'undefined') return;
    if (audio.__orchardFadeRaf) {
      cancelAnimationFrame(audio.__orchardFadeRaf);
      audio.__orchardFadeRaf = 0;
    }
    const pauseAtEnd = Boolean(options.pauseAtEnd);
    const startVolume = Number(audio.volume) || 0;
    const safeTargetVolume = Math.max(0, Math.min(1, Number(targetVolume) || 0));
    const safeDurationMs = Math.max(1, Number(durationMs) || 1);
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const tick = (nowRaw) => {
      const now = Number.isFinite(Number(nowRaw)) ? Number(nowRaw) : Date.now();
      const progress = Math.max(0, Math.min(1, (now - startTime) / safeDurationMs));
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      audio.volume = startVolume + ((safeTargetVolume - startVolume) * easedProgress);
      if (progress < 1) {
        audio.__orchardFadeRaf = requestAnimationFrame(tick);
        return;
      }
      audio.volume = safeTargetVolume;
      audio.__orchardFadeRaf = 0;
      if (pauseAtEnd) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
    audio.__orchardFadeRaf = requestAnimationFrame(tick);
  }, []);

  const playTimeTransitionAudio = useCallback((audio, durationMs = 1400) => {
    if (!audio) return;
    const safeDurationMs = Math.max(100, Number(durationMs) || 1400);
    const fadeInMs = Math.max(40, Math.min(260, Math.round(safeDurationMs * 0.28)));
    const fadeOutMs = Math.max(50, Math.min(380, Math.round(safeDurationMs * 0.38)));
    if (timeTransitionFadeOutTimerRef.current) {
      clearTimeout(timeTransitionFadeOutTimerRef.current);
      timeTransitionFadeOutTimerRef.current = null;
    }
    [dayTimeTransitionAudioRef.current, nightTimeTransitionAudioRef.current]
      .filter((candidate) => candidate && candidate !== audio)
      .forEach((candidate) => fadeAudioTo(candidate, 0, fadeOutMs, { pauseAtEnd: true }));
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
    audio.play().catch(() => {});
    fadeAudioTo(audio, volumeRef.current, fadeInMs);
    timeTransitionFadeOutTimerRef.current = setTimeout(() => {
      timeTransitionFadeOutTimerRef.current = null;
      fadeAudioTo(audio, 0, fadeOutMs, { pauseAtEnd: true });
    }, Math.max(0, safeDurationMs - fadeOutMs));
  }, [fadeAudioTo]);

  const playRandomAudio = useCallback((audios = []) => {
    const candidates = Array.isArray(audios) ? audios.filter(Boolean) : [];
    if (!candidates.length) return;
    playAudio(candidates[Math.floor(Math.random() * candidates.length)]);
  }, [playAudio]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    [
      menuButtonAudioRef.current,
      uiOpenAudioRef.current,
      checkingButtonAudioRef.current,
      slotPickerAudioRef.current,
      phoneUnlockAudioRef.current,
      phoneTakeOutAudioRef.current,
      phoneAppTapAudioRef.current,
      mapOpenAudioRef.current,
      dayTimeTransitionAudioRef.current,
      nightTimeTransitionAudioRef.current,
      ...smallDoorOpenAudioRefs.current,
      ...smallDoorCloseAudioRefs.current,
      ...largeDoorOpenAudioRefs.current,
      ...largeDoorCloseAudioRefs.current,
      controlPanelSwitchAudioRef.current,
      kepcoPowerOnAudioRef.current,
      kepcoPowerOffAudioRef.current,
      shopBarcodeAudioRef.current,
      shopCardPaymentAudioRef.current,
      ...shopCardReceiptAudioRefs.current
    ]
      .filter(Boolean)
      .forEach((audio) => {
        audio.volume = volume;
      });
  }, [volume]);

  useEffect(() => {
    if (typeof Audio === 'undefined') return undefined;
    menuButtonAudioRef.current = createAudio(FARM_MENU_BUTTON_SOUND, volumeRef.current);
    uiOpenAudioRef.current = createAudio(UI_OPEN_SOUND, volumeRef.current);
    checkingButtonAudioRef.current = createAudio(CHECKING_BUTTON_SOUND, volumeRef.current);
    slotPickerAudioRef.current = createAudio(SLOT_PICKER_OPEN_SOUND, volumeRef.current);
    phoneUnlockAudioRef.current = createAudio(PHONE_UNLOCK_SOUND, volumeRef.current);
    phoneTakeOutAudioRef.current = createAudio(PHONE_TAKE_OUT_SOUND, volumeRef.current);
    phoneAppTapAudioRef.current = createAudio(PHONE_APP_TAP_SOUND, volumeRef.current);
    mapOpenAudioRef.current = createAudio(MAP_OPEN_SOUND, volumeRef.current);
    dayTimeTransitionAudioRef.current = createAudio(DAY_TIME_TRANSITION_SOUND, volumeRef.current);
    nightTimeTransitionAudioRef.current = createAudio(NIGHT_TIME_TRANSITION_SOUND, volumeRef.current);
    smallDoorOpenAudioRefs.current = [SMALL_DOOR_OPEN_SOUND, SMALL_DOOR_OPEN_SOUND_2]
      .map((src) => createAudio(src, volumeRef.current));
    smallDoorCloseAudioRefs.current = [SMALL_DOOR_CLOSE_SOUND, SMALL_DOOR_CLOSE_SOUND_2]
      .map((src) => createAudio(src, volumeRef.current));
    largeDoorOpenAudioRefs.current = [
      LARGE_DOOR_OPEN_SOUND,
      LARGE_DOOR_OPEN_SOUND_2,
      LARGE_DOOR_OPEN_SOUND_3,
      LARGE_DOOR_OPEN_SOUND_4
    ].map((src) => createAudio(src, volumeRef.current));
    largeDoorCloseAudioRefs.current = [
      LARGE_DOOR_CLOSE_SOUND,
      LARGE_DOOR_CLOSE_SOUND_2,
      LARGE_DOOR_CLOSE_SOUND_3,
      LARGE_DOOR_CLOSE_SOUND_4
    ].map((src) => createAudio(src, volumeRef.current));
    controlPanelSwitchAudioRef.current = createAudio(CONTROL_PANEL_SWITCH_SOUND, volumeRef.current);
    kepcoPowerOnAudioRef.current = createAudio(KEPCO_POWER_ON_SOUND, volumeRef.current);
    kepcoPowerOffAudioRef.current = createAudio(KEPCO_POWER_OFF_SOUND, volumeRef.current);
    shopBarcodeAudioRef.current = createAudio(SHOP_BARCODE_SOUND, volumeRef.current);
    shopCardPaymentAudioRef.current = createAudio(SHOP_CARD_PAYMENT_SOUND, volumeRef.current);
    shopCardReceiptAudioRefs.current = [
      SHOP_CARD_RECEIPT_SOUND_1,
      SHOP_CARD_RECEIPT_SOUND_2,
      SHOP_CARD_RECEIPT_SOUND_3
    ].map((src) => createAudio(src, volumeRef.current));

    return () => {
      if (timeTransitionFadeOutTimerRef.current) {
        clearTimeout(timeTransitionFadeOutTimerRef.current);
        timeTransitionFadeOutTimerRef.current = null;
      }
      [
        menuButtonAudioRef.current,
        uiOpenAudioRef.current,
        checkingButtonAudioRef.current,
        slotPickerAudioRef.current,
        phoneUnlockAudioRef.current,
        phoneTakeOutAudioRef.current,
        phoneAppTapAudioRef.current,
        mapOpenAudioRef.current,
        dayTimeTransitionAudioRef.current,
        nightTimeTransitionAudioRef.current,
        ...smallDoorOpenAudioRefs.current,
        ...smallDoorCloseAudioRefs.current,
        ...largeDoorOpenAudioRefs.current,
        ...largeDoorCloseAudioRefs.current,
        controlPanelSwitchAudioRef.current,
        kepcoPowerOnAudioRef.current,
        kepcoPowerOffAudioRef.current,
        shopBarcodeAudioRef.current,
        shopCardPaymentAudioRef.current,
        ...shopCardReceiptAudioRefs.current
      ]
        .filter(Boolean)
        .forEach((audio) => {
          if (audio.__orchardFadeRaf) {
            cancelAnimationFrame(audio.__orchardFadeRaf);
            audio.__orchardFadeRaf = 0;
          }
          audio.pause();
        });
      menuButtonAudioRef.current = null;
      uiOpenAudioRef.current = null;
      checkingButtonAudioRef.current = null;
      slotPickerAudioRef.current = null;
      phoneUnlockAudioRef.current = null;
      phoneTakeOutAudioRef.current = null;
      phoneAppTapAudioRef.current = null;
      mapOpenAudioRef.current = null;
      dayTimeTransitionAudioRef.current = null;
      nightTimeTransitionAudioRef.current = null;
      smallDoorOpenAudioRefs.current = [];
      smallDoorCloseAudioRefs.current = [];
      largeDoorOpenAudioRefs.current = [];
      largeDoorCloseAudioRefs.current = [];
      controlPanelSwitchAudioRef.current = null;
      kepcoPowerOnAudioRef.current = null;
      kepcoPowerOffAudioRef.current = null;
      shopBarcodeAudioRef.current = null;
      shopCardPaymentAudioRef.current = null;
      shopCardReceiptAudioRefs.current = [];
    };
  }, []);

  return {
    playMenuButtonSound: useCallback(() => playAudio(menuButtonAudioRef.current), [playAudio]),
    playUiOpenSound: useCallback(() => playAudio(uiOpenAudioRef.current), [playAudio]),
    playCheckingButtonSound: useCallback(() => playAudio(checkingButtonAudioRef.current), [playAudio]),
    playSlotPickerOpenSound: useCallback(() => playAudio(slotPickerAudioRef.current), [playAudio]),
    playPhoneUnlockSound: useCallback(() => playAudio(phoneUnlockAudioRef.current), [playAudio]),
    playPhoneTakeOutSound: useCallback(() => playAudio(phoneTakeOutAudioRef.current), [playAudio]),
    playPhoneAppTapSound: useCallback(() => playAudio(phoneAppTapAudioRef.current), [playAudio]),
    playMapOpenSound: useCallback(() => playAudio(mapOpenAudioRef.current), [playAudio]),
    playDayTimeTransitionSound: useCallback((durationMs) => playTimeTransitionAudio(dayTimeTransitionAudioRef.current, durationMs), [playTimeTransitionAudio]),
    playNightTimeTransitionSound: useCallback((durationMs) => playTimeTransitionAudio(nightTimeTransitionAudioRef.current, durationMs), [playTimeTransitionAudio]),
    playSmallDoorOpenSound: useCallback(() => playRandomAudio(smallDoorOpenAudioRefs.current), [playRandomAudio]),
    playSmallDoorCloseSound: useCallback(() => playRandomAudio(smallDoorCloseAudioRefs.current), [playRandomAudio]),
    playLargeDoorOpenSound: useCallback(() => playRandomAudio(largeDoorOpenAudioRefs.current), [playRandomAudio]),
    playLargeDoorCloseSound: useCallback(() => playRandomAudio(largeDoorCloseAudioRefs.current), [playRandomAudio]),
    playControlPanelSwitchSound: useCallback(() => playAudio(controlPanelSwitchAudioRef.current), [playAudio]),
    playKepcoPowerOnSound: useCallback(() => playAudio(kepcoPowerOnAudioRef.current), [playAudio]),
    playKepcoPowerOffSound: useCallback(() => playAudio(kepcoPowerOffAudioRef.current), [playAudio]),
    playShopBarcodeSound: useCallback(
      () => playAudioWithVolumeRatio(shopBarcodeAudioRef.current, SHOP_BARCODE_VOLUME_RATIO),
      [playAudioWithVolumeRatio]
    ),
    playShopCardPaymentSound: useCallback(
      () => playAudioWithVolumeRatio(shopCardPaymentAudioRef.current, SHOP_CARD_PAYMENT_VOLUME_RATIO),
      [playAudioWithVolumeRatio]
    ),
    playShopCardReceiptSound: useCallback(
      () => {
        const candidates = shopCardReceiptAudioRefs.current.filter(Boolean);
        if (!candidates.length) return;
        playAudioWithVolumeRatio(candidates[Math.floor(Math.random() * candidates.length)], SHOP_CARD_RECEIPT_VOLUME_RATIO);
      },
      [playAudioWithVolumeRatio]
    )
  };
};
