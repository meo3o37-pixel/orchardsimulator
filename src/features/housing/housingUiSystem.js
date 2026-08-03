import { clamp } from '../../utils/common';

export const HOUSING_RAIN_AMBIENT_VOLUME_RATIO = 0.62;

export const DEFAULT_HOUSING_ENTRY_BUTTON_POSITION = Object.freeze({
  xPercent: 67,
  yPercent: 78,
});

export const DEFAULT_HOUSING_EXIT_BUTTON_POSITION = Object.freeze({
  xPercent: 61.5,
  yPercent: 43.5,
});

const trackIndexFromSeed = (seed, size) => {
  const safeSize = Math.max(1, Math.floor(Number(size) || 1));
  let hash = 0;
  const text = String(seed || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0;
  }
  return hash % safeSize;
};

const pickAmbientTrackFromList = (tracks, seed) => {
  if (!Array.isArray(tracks) || !tracks.length) return '';
  const index = trackIndexFromSeed(seed, tracks.length);
  return tracks[index] || tracks[0] || '';
};

export const resolveHousingRainAmbientPlaylist = ({
  weatherName = '',
  day = 1,
  isNight = false,
  tracks: rainTracks = [],
  lightRainVolumeRatio = 1
} = {}) => {
  const weather = String(weatherName || '');
  const seed = `housing-rain:${day}:${isNight ? 'night' : 'day'}:${weather}`;
  let tracks = [];
  let volumeRatio = 1;
  if (/대설|폭설|눈|진눈깨비/.test(weather)) {
    tracks = [];
  } else if (/폭우|장맛비|강한소나기|강한봄비|강한가을비|장마|우박/.test(weather)) {
    tracks = rainTracks;
    volumeRatio = 1.12;
  } else if (/이슬비|가을이슬비/.test(weather)) {
    tracks = rainTracks;
    volumeRatio = lightRainVolumeRatio;
  } else if (/비|소나기|봄비|가을비|약한소나기/.test(weather)) {
    tracks = rainTracks;
  }
  return {
    seed,
    tracks,
    volumeRatio,
    initialTrack: pickAmbientTrackFromList(tracks, seed)
  };
};

export const normalizeHousingEntryButtonPosition = (raw) => {
  const xPercent = clamp(Number(raw?.xPercent), 12, 88);
  const yPercent = clamp(Number(raw?.yPercent), 18, 90);
  return {
    xPercent: Number.isFinite(xPercent) ? xPercent : DEFAULT_HOUSING_ENTRY_BUTTON_POSITION.xPercent,
    yPercent: Number.isFinite(yPercent) ? yPercent : DEFAULT_HOUSING_ENTRY_BUTTON_POSITION.yPercent,
  };
};

export const normalizeHousingExitButtonPosition = (raw) => {
  const xPercent = clamp(Number(raw?.xPercent), 12, 88);
  const yPercent = clamp(Number(raw?.yPercent), 18, 90);
  return {
    xPercent: Number.isFinite(xPercent) ? xPercent : DEFAULT_HOUSING_EXIT_BUTTON_POSITION.xPercent,
    yPercent: Number.isFinite(yPercent) ? yPercent : DEFAULT_HOUSING_EXIT_BUTTON_POSITION.yPercent,
  };
};
