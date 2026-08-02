import mainMenuImage from '../../assets/images/main-menu.png';
import menuBgm1 from '../../assets/images/효과음/메인메뉴/메인메뉴1.mp3';
import menuBgm2 from '../../assets/images/효과음/메인메뉴/메인메뉴2.mp3';
import uiClickSound from '../../assets/images/효과음/UI/딸깍음1.mp3';
import uiOpenSound from '../../assets/images/효과음/UI/UI 바로 열리는 소리.mp3';
import uiCheckSound from '../../assets/images/효과음/UI/체킹 버튼음.mp3';
import phoneUnlockSound from '../../assets/images/효과음/UI/핸드폰 잠금해제.mp3';
import mapOpenSound from '../../assets/images/효과음/UI/지도 열리는 사운드.mp3';

const mapImagesByPath = import.meta.glob('../../assets/images/지도/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const weatherImagesByPath = import.meta.glob('../../assets/images/날씨/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const treeImagesByPath = import.meta.glob('../../assets/images/tree/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const itemImagesByPath = import.meta.glob('../../assets/images/아이템/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const vehicleImagesByPath = import.meta.glob('../../assets/images/자동차실루엣/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const machineImagesByPath = import.meta.glob('../../assets/images/농기계/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const facilityImagesByPath = import.meta.glob('../../assets/images/시설/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const uniq = (items = []) => [...new Set(items.filter(Boolean).map((item) => String(item)))];
const values = (modules = {}) => Object.values(modules).filter(Boolean);
const pathIncludesAny = (path, keywords = []) => {
  const safePath = String(path || '');
  return keywords.some((keyword) => safePath.includes(keyword));
};
const valuesWherePathIncludes = (modules = {}, keywords = []) => (
  Object.entries(modules)
    .filter(([path]) => pathIncludesAny(path, keywords))
    .map(([, src]) => src)
    .filter(Boolean)
);

const centerMapImages = valuesWherePathIncludes(mapImagesByPath, ['전체지도', '마을', '소도시']);
const starterTreeImages = valuesWherePathIncludes(treeImagesByPath, ['1년생/주간', '1년생\\주간', '봄 1년생', '여름 1년생']);
const commonWeatherImages = valuesWherePathIncludes(weatherImagesByPath, ['청명', '맑음', '비살짝', '비 오는', '흐린']);
const seasonalTreeImages = valuesWherePathIncludes(treeImagesByPath, [
  '주간 날씨',
  '밤 날씨',
  '3년생이상/주간',
  '3년생이상\\주간',
  '3년생이상/밤',
  '3년생이상\\밤',
  '겨울 1년생',
  '가을 1년생',
  '겨울 2년생',
  '가을 2년생'
]);
const seasonalWeatherImages = valuesWherePathIncludes(weatherImagesByPath, [
  '봄',
  '여름',
  '가을',
  '겨울',
  '비',
  '눈',
  '황사',
  '흐린',
  '폭염'
]);
const commonItemImages = valuesWherePathIncludes(itemImagesByPath, ['팔레트', '맨손이미지', '사과', '컨테이너']);

export const LOADING_ASSET_PHASES = Object.freeze({
  boot: Object.freeze({
    label: '기본 화면 준비',
    blocking: true,
    concurrency: 4,
    assets: Object.freeze([
      { type: 'image', src: mainMenuImage, label: '메인 화면' },
      { type: 'audio', src: uiClickSound, label: '버튼 소리' },
      { type: 'audio', src: uiOpenSound, label: '창 여는 소리' },
      { type: 'audio', src: uiCheckSound, label: '확인 소리' },
      { type: 'audio', src: phoneUnlockSound, label: '휴대폰 소리' },
      { type: 'audio', src: mapOpenSound, label: '지도 소리' }
    ])
  }),
  menuAudio: Object.freeze({
    label: '메인 메뉴 음악',
    blocking: false,
    concurrency: 1,
    assets: Object.freeze([
      { type: 'audio', src: menuBgm1, label: '메인 음악 1' },
      { type: 'audio', src: menuBgm2, label: '메인 음악 2' }
    ])
  }),
  map: Object.freeze({
    label: '지도 이미지',
    blocking: false,
    concurrency: 3,
    assets: Object.freeze(centerMapImages.map((src, idx) => ({ type: 'image', src, label: `지도 ${idx + 1}` })))
  }),
  field: Object.freeze({
    label: '과수원 기본 이미지',
    blocking: false,
    concurrency: 2,
    assets: Object.freeze(uniq([...starterTreeImages, ...commonWeatherImages]).map((src, idx) => ({
      type: 'image',
      src,
      label: `과수원 ${idx + 1}`
    })))
  }),
  fieldSeasonal: Object.freeze({
    label: '계절/날씨 과수원 이미지',
    blocking: false,
    concurrency: 2,
    assets: Object.freeze(uniq([...seasonalTreeImages, ...seasonalWeatherImages]).map((src, idx) => ({
      type: 'image',
      src,
      label: `계절 과수원 ${idx + 1}`
    })))
  }),
  warehouse: Object.freeze({
    label: '창고와 아이템',
    blocking: false,
    concurrency: 4,
    assets: Object.freeze(commonItemImages.map((src, idx) => ({ type: 'image', src, label: `아이템 ${idx + 1}` })))
  }),
  vehicle: Object.freeze({
    label: '차량과 농기계',
    blocking: false,
    concurrency: 3,
    assets: Object.freeze(uniq([...values(vehicleImagesByPath), ...values(machineImagesByPath)]).map((src, idx) => ({
      type: 'image',
      src,
      label: `장비 ${idx + 1}`
    })))
  }),
  facility: Object.freeze({
    label: '시설 이미지',
    blocking: false,
    concurrency: 3,
    assets: Object.freeze(values(facilityImagesByPath).map((src, idx) => ({ type: 'image', src, label: `시설 ${idx + 1}` })))
  })
});

export const RECOMMENDED_PRELOAD_PHASES = Object.freeze(['menuAudio', 'map', 'field', 'warehouse', 'vehicle', 'facility']);

export const POST_BOOT_PRELOAD_PHASES = Object.freeze(['fieldSeasonal']);
