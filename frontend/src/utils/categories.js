const categories = [
  { value: 'staircase', label: 'Staircase', color: '#d33' },
  { value: 'door', label: 'Door', color: '#0645ad' },
  { value: 'bridge', label: 'Bridge', color: '#14866d' },
  { value: 'wall', label: 'Wall', color: '#ac6600' },
  { value: 'pipe', label: 'Pipe', color: '#6b4c9a' },
  { value: 'window', label: 'Window', color: '#2a4b8d' },
  { value: 'platform', label: 'Platform', color: '#b32424' },
  { value: 'other', label: 'Other', color: '#72777d' },
];

export function getCategoryByValue(value) {
  return categories.find((c) => c.value === value) || categories[categories.length - 1];
}

export function getCategoryColor(value) {
  const cat = getCategoryByValue(value);
  return cat.color;
}

export default categories;
