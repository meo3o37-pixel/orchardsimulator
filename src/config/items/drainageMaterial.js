// Retail reference prices; excavation, gravel/filter and access work are separate.
export const DRAINAGE_MATERIAL_ITEMS = [
  { key: 'drainagePerforatedPipe100x6m', name: 'HDPE 유공관 100mm · 6m', price: 15400,
    desc: '검은 고밀도 폴리에틸렌(플라스틱) 배수관. 나무 열 아래에서 뿌리층의 물을 모읍니다. 1본 6m · 매설 시 보유 관부터 사용하고 남은 길이는 해당 토지에 보관합니다.',
    unit: '본', durable: false, weightKg: 6, lengthM: 6, diameterMm: 100, material: 'HDPE', drainageRouteType: 'pipe100',
    specSource: '대주피엔아이 HDPE DC 유공관(100mm, 1본 6m); 케이토목 D100×6000(6kg, 15,400원) 참고',
    sourceUrl: 'https://www.ktomok.com/shop/item.php?it_id=1581998898' },
  { key: 'drainageCollectorPipe150x6m', name: 'HDPE 집수 주관 150mm · 6m', price: 36900,
    desc: '검은 고밀도 폴리에틸렌(플라스틱) 무공 직관. 나무 열의 유공관에서 모인 물을 배수로로 연결합니다. 1본 6m · 매설 시 보유 관부터 사용하고 남은 길이는 해당 토지에 보관합니다.',
    unit: '본', durable: false, weightKg: 11, lengthM: 6, diameterMm: 150, material: 'HDPE', drainageRouteType: 'pipe150',
    specSource: '케이토목 HDPE이중벽관 직관 D150×6000(11kg, 36,900원) 참고',
    sourceUrl: 'https://ktomok.com/shop/list.php?ca_id=4575&device=pc&sort=it_order&sortodr=asc' }
];
