const categories = [
  { value: 'pure', label: 'Pure Type', japanese: '純粋タイプ (Junsui taipu)', color: '#72777d' },
  { value: 'pure_staircase', label: 'Pure Staircase', japanese: '無用階段 (Muyō kaidan)', color: '#d33' },
  { value: 'useless_doorway', label: 'Useless Doorway', japanese: '無用門 (Muyō mon)', color: '#0645ad' },
  { value: 'hisashi', label: 'Hisashi', japanese: 'ヒサシ (Hisashi)', color: '#14866d' },
  { value: 'useless_window', label: 'Useless Window', japanese: '無用窓 (Muyō mado)', color: '#2a4b8d' },
  { value: 'a_bomb', label: 'A-Bomb Type', japanese: '原爆タイプ (Genbaku taipu)', color: '#b32424' },
  { value: 'elevated', label: 'Elevated Type', japanese: '高所 (Kōsho)', color: '#6b4c9a' },
  { value: 'outie', label: 'Outie', japanese: 'でべそ (Debeso)', color: '#36c' },
  { value: 'castella', label: 'Castella', japanese: 'カステラ (Kasutera)', color: '#c4762d' },
  { value: 'atago', label: 'Atago', japanese: 'アタゴ (Atago)', color: '#448844' },
  { value: 'live_burial', label: 'Live Burial', japanese: '生き埋め (Ikiume)', color: '#555a6e' },
  { value: 'abe_sada', label: 'Abe Sada', japanese: '阿部定 (Abe Sada)', color: '#cc4444' },
  { value: 'useless_bridge', label: 'Useless Bridge', japanese: '無用橋 (Muyō bashi)', color: '#3366aa' },
  { value: 'uncategorized', label: 'Uncategorized', japanese: null, color: '#72777d' },
];

export function getCategoryByValue(value) {
  return categories.find((c) => c.value === value) || categories[categories.length - 1];
}

export function getCategoryColor(value) {
  const cat = getCategoryByValue(value);
  return cat.color;
}

export default categories;
