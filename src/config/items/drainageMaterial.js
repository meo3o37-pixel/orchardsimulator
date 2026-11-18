// Retail reference prices; excavation, gravel/filter and access work are separate.
export const DRAINAGE_MATERIAL_ITEMS = [
  {key:'drainagePe200x6m',name:'PE관 200mm · 6m',price:81000,unit:'본',durable:false,weightKg:15,lengthM:6,diameterMm:200,material:'PE',drainageRouteType:'lined',desc:'PE관 배수로 자가 시공용. 1본 6m · 사용 길이만 차감하고 절단 잔량은 토지에 보관합니다. 가격·중량은 게임 기준.'},
  {key:'drainageConcrete600x1m',name:'콘크리트 수로 600mm · 1m',price:67500,unit:'세트',durable:false,weightKg:450,lengthM:1,material:'concrete',drainageRouteType:'main',desc:'내부 폭 60cm 콘크리트 수로와 차량 통행용 상부 덮개 세트. 1세트 1m · 설치 잔량은 토지에 보관합니다. 가격·중량은 게임 기준.'},
  { key: 'drainagePerforatedPipe100x6m', name: 'HDPE 유공관 100mm · 6m', price: 5544,
    desc: '검은 고밀도 폴리에틸렌(플라스틱) 배수관. 나무 열 아래에서 뿌리층의 물을 모읍니다. 1본 6m · 매설 시 보유 관부터 사용하고 남은 길이는 해당 토지에 보관합니다.',
    unit: '본', durable: false, weightKg: 6, lengthM: 6, diameterMm: 100, material: 'HDPE', drainageRouteType: 'pipe100',
    specSource: '대주피엔아이 HDPE DC 유공관(100mm, 1본 6m); 케이토목 D100×6000(6kg, 15,400원) 참고',
    sourceUrl: 'https://www.ktomok.com/shop/item.php?it_id=1581998898' },
  { key: 'drainageCollectorPipe150x6m', name: 'HDPE 유공관 150mm · 6m', price: 11070,
    desc: '검은 고밀도 폴리에틸렌(플라스틱) 유공 집수관. 나무 열의 유공관에서 모인 물을 배수로로 연결합니다. 1본 6m · 매설 시 보유 관부터 사용하고 남은 길이는 해당 토지에 보관합니다.',
    unit: '본', durable: false, weightKg: 11, lengthM: 6, diameterMm: 150, material: 'HDPE', drainageRouteType: 'pipe150',
    specSource: '기존 무공 직관 D150×6000 가격을 임시 적용. 유공관 실판매가는 확인 필요',
    sourceUrl: 'https://ktomok.com/shop/list.php?ca_id=4575&device=pc&sort=it_order&sortodr=asc' }
];
