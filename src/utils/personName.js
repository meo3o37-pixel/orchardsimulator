const CREW_NAME_LAST_NAMES = Object.freeze([
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전', '홍', '고', '문', '양'
]);

const CREW_NAME_FIRST_NAMES_MALE = Object.freeze([
  '민수', '영수', '철호', '준호', '성민', '도윤', '하준', '지훈', '현우', '상민', '은호', '태윤', '서준', '민재', '지호', '동현',
  '우진', '승현', '재윤', '기성', '용태', '병수', '광호', '태식', '종민', '대호', '건우', '정우', '시우', '주원', '연우', '재호',
  '성호', '영호', '진우', '준석', '현수', '태호', '민호', '성우', '도현', '재민', '성준', '호진', '인수', '창호', '원석', '재성',
  '만수', '복수', '상구', '상철', '영길', '봉수', '병철', '석진', '석호', '달수', '정식', '종수', '두식', '춘배', '용수', '동수',
  '경수', '경호', '남수', '남호', '명수', '명호', '정남', '정식', '재식', '주태', '진철', '진식', '태성', '태석', '한수', '한길',
  '홍수', '홍석', '희수', '희철', '길동', '길수', '만복', '만철', '봉철', '삼수', '상복', '상태', '성복', '영복', '영덕', '영태'
]);

const CREW_NAME_FIRST_NAMES_FEMALE = Object.freeze([
  '지은', '서연', '서윤', '하윤', '지우', '민지', '수빈', '예은', '예린', '채원', '가은', '다은', '소연', '유진', '유나', '나연',
  '은지', '지원', '혜원', '하은', '수아', '지아', '아영', '보경', '보람', '은서', '채은', '서현', '지현', '민서', '연서', '주희',
  '소희', '윤서', '다현', '예지', '혜진', '수연', '지민', '아린', '세은', '유리', '소민', '가영', '하린', '채린', '민아', '지수',
  '영자', '순자', '정자', '옥자', '춘자', '명자', '숙자', '복자', '미자', '금자', '은자', '덕자', '정순', '영순', '옥순', '말순',
  '길순', '봉순', '희순', '화순', '영희', '미숙', '정숙', '경숙', '현숙', '인숙', '순희', '명희', '복희', '선희', '영숙', '영옥',
  '정옥', '경옥', '미옥', '혜숙', '혜자', '선자', '경자', '순옥', '인옥', '옥희', '연숙', '연자', '정희', '명숙', '말자', '복순'
]);

const CREW_GENDER_BY_FIRST_NAME = Object.freeze({
  ...Object.fromEntries(CREW_NAME_FIRST_NAMES_MALE.map((name) => [name, 'male'])),
  ...Object.fromEntries(CREW_NAME_FIRST_NAMES_FEMALE.map((name) => [name, 'female']))
});

const randomIntInclusive = (minRaw, maxRaw) => {
  const min = Math.ceil(Number(minRaw) || 0);
  const max = Math.floor(Number(maxRaw) || 0);
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const crewGenderOfName = (name) => {
  const raw = String(name || '').trim();
  if (!raw) return 'neutral';
  const firstName = raw.slice(1);
  return CREW_GENDER_BY_FIRST_NAME[firstName] || 'neutral';
};

export const personEmojiOfGender = (genderRaw = 'neutral') => {
  const gender = String(genderRaw || 'neutral');
  if (gender === 'male') return '👨‍🌾';
  if (gender === 'female') return '👩‍🌾';
  return '🧑‍🌾';
};

export const buildRandomCrewProfiles = (count, usedNames = new Set()) => {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0));
  const profiles = [];
  let guard = 0;
  while (profiles.length < safeCount && guard < 800) {
    const gender = Math.random() < 0.5 ? 'male' : 'female';
    const firstNamePool = gender === 'female' ? CREW_NAME_FIRST_NAMES_FEMALE : CREW_NAME_FIRST_NAMES_MALE;
    const name = `${CREW_NAME_LAST_NAMES[randomIntInclusive(0, CREW_NAME_LAST_NAMES.length - 1)]}${firstNamePool[randomIntInclusive(0, firstNamePool.length - 1)]}`;
    guard += 1;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    profiles.push({ name, gender });
  }
  while (profiles.length < safeCount) {
    const fallback = `외부인력${usedNames.size + 1}`;
    usedNames.add(fallback);
    profiles.push({ name: fallback, gender: 'neutral' });
  }
  return profiles;
};

export const buildRandomPersonProfile = (usedNames = new Set()) => (
  buildRandomCrewProfiles(1, usedNames)[0] || { name: '외부인력1', gender: 'neutral' }
);
