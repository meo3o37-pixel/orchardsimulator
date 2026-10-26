export const DEFAULT_APPLE_PRICE_TABS = [
  {
    key: 'hongro',
    label: '홍로',
    title: '추석 사과 가격표 (홍로)',
    year: '2026',
    farmName: '바람빛농원 · 바람한조각',
    address: '청송군 안덕면 당민길 49-51',
    summary: '정품 4kg/8kg, 소포장, 흠과 기준 가격표',
    footnote: '8kg는 4kg 2개 금액에서 4천원 뺌',
    sections: [
      {
        key: 'premium',
        title: '정품 4kg / 8kg',
        columns: ['다이', '갯수', '가격'],
        rows: [
          ['3다이 왕특', '9-10과', '-'],
          ['4전 특대', '11-12과', '65,000 / 126,000'],
          ['4후 대', '13-14과', '55,000 / 106,000'],
          ['5다이 중', '15-16과', '47,000 / 90,000'],
          ['6다이 소', '18-19과', '45,000 / 86,000'],
          ['7,8전다이 꼬마과', '20-25과', '40,000 / 76,000']
        ]
      },
      {
        key: 'small-pack',
        title: '소포장',
        columns: ['규격', '분류', '갯수', '가격'],
        rows: [
          ['2kg', '중과', '7-8과', '28,500'],
          ['3kg 4후', '대과', '10과', '45,000'],
          ['3kg 5다이', '중과', '11-12과', '40,000'],
          ['3kg 6다이', '소과', '14-15과', '35,000']
        ]
      },
      {
        key: 'blemished',
        title: '흠과',
        columns: ['다이', '분류', '갯수', '가격'],
        rows: [
          ['3,4 다이', '큰흠과', '11-13과', '43,000 / 82,000'],
          ['5,6 다이', '중간흠과', '16-18과', '37,000 / 70,000'],
          ['7,8다이', '꼬마과', '20-25과', '32,000 / 60,000']
        ]
      }
    ]
  }
];

export const applePriceRowInStock = (section, index) => section.rowStock?.[index] !== false;

// Keep stock attached to its item when rows are reordered, copied or removed.
export function editApplePriceRows(section, action, index = 0) {
  const items = section.rows.map((row, i) => ({ row, stock: applePriceRowInStock(section, i) }));
  if (action === 'add') items.push({ row: section.columns.map(() => ''), stock: true });
  else if (index < 0 || index >= items.length) return section;
  else if (action === 'delete') items.splice(index, 1);
  else if (action === 'duplicate') items.splice(index + 1, 0, { row: [...items[index].row], stock: items[index].stock });
  else if (action === 'up' || action === 'down') {
    const target = index + (action === 'up' ? -1 : 1);
    if (target < 0 || target >= items.length) return section;
    [items[index], items[target]] = [items[target], items[index]];
  } else return section;
  return { ...section, rows: items.map((item) => item.row), rowStock: items.map((item) => item.stock) };
}

export function validateApplePriceTabs(tabs) {
  const fail = (message) => { throw new Error(message); };
  const text = (value, name, max = 200, required = false) => {
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`${name}을 확인해주세요. (최대 ${max}자)`);
    return value.trim();
  };
  const key = (value, keys) => {
    if (typeof value !== 'string' || !/^[a-z0-9-]{1,80}$/.test(value) || keys.has(value)) fail('품종 또는 분류의 식별자가 중복되거나 올바르지 않습니다.');
    keys.add(value);
    return value;
  };
  if (!Array.isArray(tabs) || tabs.length < 1 || tabs.length > 20) fail('품종은 1~20개까지 등록할 수 있습니다.');
  const tabKeys = new Set();
  return tabs.map((tab) => {
    if (!tab || !Array.isArray(tab.sections) || tab.sections.length < 1 || tab.sections.length > 20) fail('각 품종에는 상품 분류가 1~20개 필요합니다.');
    const sectionKeys = new Set();
    return {
      key: key(tab.key, tabKeys),
      label: text(tab.label, '품종명', 60, true),
      title: text(tab.title ?? '', '가격표 제목', 150),
      year: text(tab.year, '연도', 20, true),
      farmName: text(tab.farmName, '농원·회사명', 150, true),
      address: text(tab.address, '주소', 200),
      summary: text(tab.summary, '요약', 300),
      footnote: text(tab.footnote, '하단 안내문', 2000),
      sections: tab.sections.map((section) => {
        if (!Array.isArray(section.columns) || section.columns.length < 2 || section.columns.length > 8) fail('각 분류의 열은 2~8개여야 합니다. 마지막 열이 가격입니다.');
        if (!Array.isArray(section.rows) || section.rows.length > 200) fail('한 분류에 품목을 200개까지 등록할 수 있습니다.');
        if (section.rowStock !== undefined && (!Array.isArray(section.rowStock) || section.rowStock.length !== section.rows.length || section.rowStock.some((stock) => typeof stock !== 'boolean'))) fail('각 품목의 재고 있음을 설정하거나 재고 없음을 선택해주세요.');
        return {
          key: key(section.key, sectionKeys),
          title: text(section.title, '분류명', 100, true),
          columns: section.columns.map((column) => text(column, '열 제목', 40, true)),
          rowStock: section.rows.map((_, index) => applePriceRowInStock(section, index)),
          rows: section.rows.map((row) => {
            if (!Array.isArray(row) || row.length !== section.columns.length) fail('품목의 칸 수와 열 수가 맞지 않습니다.');
            const cells = row.map((cell) => text(cell, '품목 내용', 150));
            if (!cells[0]) fail('각 품목의 첫 번째 칸에 품목명이나 규격을 입력해주세요.');
            if (!cells.at(-1)) fail('가격을 입력해주세요. 미정 또는 판매 중지는 - 로 표시할 수 있습니다.');
            return cells;
          })
        };
      })
    };
  });
}
