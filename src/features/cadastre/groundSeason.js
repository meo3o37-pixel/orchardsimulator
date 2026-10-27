import { toDate, seasonKo } from '../../utils/common';

// Basic seasonal ground cover, deliberately independent of actual weed quantity.
export const SEASONAL_GREEN_COVER = Object.freeze([5, 5, 15, 40, 70, 90, 90, 90, 70, 40, 10, 5]);

export function groundSeasonOf(rawDay = 1, rawWeather = '') {
  const number = Number(rawDay);
  const day = Number.isFinite(number) ? Math.max(1, Math.floor(number)) : 1;
  const date = toDate(day), month = date.getMonth() + 1;
  const target = SEASONAL_GREEN_COVER[month - 1];
  const previous = SEASONAL_GREEN_COVER[(month + 10) % 12];
  const progress = Math.min(1, (date.getDate() - 1) / 14);
  const greenCover = Math.round((previous + (target - previous) * progress) * 100) / 100;
  const weather = String(rawWeather?.name || rawWeather || '');
  const snowOpacity = /진눈깨비/.test(weather) ? .4 : /대설|폭설/.test(weather) ? .98 : /눈/.test(weather) ? .84 : 0;
  const dormantTint = month === 10 ? .07 : month === 11 ? .12 : month === 12 ? .08 : month <= 2 ? .04 : 0;
  return { month, label: seasonKo(month), greenCover, snowOpacity, dormantTint, isSnowing: snowOpacity > 0 };
}
