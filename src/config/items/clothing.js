export const CLOTHING_ITEMS = [
  {
    key: 'workCottonGloves',
    type: 'hands',
    name: '목장갑',
    price: 1200,
    desc: '가벼운 농작업용 면장갑. 흙일과 상자 정리에 기본으로 쓰입니다.',
    unit: '켤레',
    durable: true,
    weightKg: 0.08,
    protection: { hand: 1 }
  },
  {
    key: 'rubberWorkGloves',
    type: 'hands',
    name: '고무장갑',
    price: 2800,
    desc: '물청소와 세척 작업에 쓰는 긴 고무장갑. 손 젖음을 줄여줍니다.',
    unit: '켤레',
    durable: true,
    weightKg: 0.16,
    protection: { hand: 1, water: 2 }
  },
  {
    key: 'farmWorkShoes',
    type: 'feet',
    name: '작업화',
    price: 32000,
    desc: '미끄럼을 줄인 기본 농장 작업화. 오래 서서 일할 때 발 피로를 줄입니다.',
    unit: '켤레',
    durable: true,
    weightKg: 1.1,
    protection: { foot: 2, slip: 1 }
  },
  {
    key: 'farmRubberBoots',
    type: 'feet',
    name: '장화',
    price: 18000,
    desc: '비 온 뒤 과수원과 물청소에 쓰는 방수 장화.',
    unit: '켤레',
    durable: true,
    weightKg: 1.4,
    protection: { foot: 1, water: 3, slip: 1 }
  },
  {
    key: 'farmWorkSet',
    type: 'upper',
    name: '작업복 상의',
    price: 42000,
    desc: '흙먼지와 잔가지를 막는 기본 작업복 상의.',
    unit: '개',
    durable: true,
    weightKg: 0.55,
    protection: { upperBody: 2, scratch: 1 }
  },
  {
    key: 'farmWorkPants',
    type: 'lower',
    name: '작업복 하의',
    price: 29000,
    desc: '무릎과 종아리 쓸림을 줄이는 기본 작업복 바지.',
    unit: '개',
    durable: true,
    weightKg: 0.55,
    protection: { lowerBody: 2, scratch: 1 }
  },
  {
    key: 'lightRainJacket',
    type: 'upper',
    name: '방수자켓',
    price: 39000,
    desc: '가벼운 비와 바람을 막는 농장용 방수자켓.',
    unit: '벌',
    durable: true,
    weightKg: 0.7,
    protection: { upperBody: 1, water: 2, wind: 1 }
  },
  {
    key: 'waterproofWorkPants',
    type: 'lower',
    name: '방수바지',
    price: 34000,
    desc: '비 온 뒤 풀밭과 세척 작업에서 하체 젖음을 줄이는 방수 작업바지.',
    unit: '개',
    durable: true,
    weightKg: 0.65,
    protection: { lowerBody: 1, water: 2, wind: 1 }
  },
  {
    key: 'winterFarmJacket',
    type: 'upper',
    name: '방한복',
    price: 69000,
    desc: '겨울 새벽 작업용 두꺼운 방한 작업복.',
    unit: '벌',
    durable: true,
    weightKg: 1.8,
    protection: { upperBody: 2, cold: 3, wind: 1 }
  },
  {
    key: 'winterFarmPants',
    type: 'lower',
    name: '방한바지',
    price: 46000,
    desc: '겨울 새벽 작업 때 하체 보온을 보강하는 두꺼운 작업바지.',
    unit: '개',
    durable: true,
    weightKg: 0.95,
    protection: { lowerBody: 2, cold: 2, wind: 1 }
  },
  {
    key: 'dustMaskSet',
    type: 'face',
    name: '방진마스크',
    price: 5500,
    desc: '먼지 많은 창고 정리와 약제 취급 전후에 쓰는 방진마스크.',
    unit: '팩',
    durable: true,
    weightKg: 0.12,
    protection: { dust: 2, face: 1 }
  },
  {
    key: 'safetyGoggles',
    type: 'face',
    name: '보안경',
    price: 9000,
    desc: '가지치기와 세척 작업 중 눈을 보호하는 투명 보안경.',
    unit: '개',
    durable: true,
    weightKg: 0.09,
    protection: { eyes: 2, splash: 1 }
  },
  {
    key: 'farmSafetyHelmet',
    type: 'head',
    name: '안전모',
    price: 15000,
    desc: '창고 정리와 시설 작업 때 머리를 보호하는 기본 안전모.',
    unit: '개',
    durable: true,
    weightKg: 0.38,
    protection: { head: 3 }
  },
  {
    key: 'reflectiveSafetyVest',
    type: 'upper',
    name: '안전조끼',
    price: 12000,
    desc: '해질녘 작업과 차량 이동 구역에서 눈에 잘 띄는 반사 조끼.',
    unit: '벌',
    durable: true,
    weightKg: 0.25,
    protection: { visibility: 3 }
  }
];
