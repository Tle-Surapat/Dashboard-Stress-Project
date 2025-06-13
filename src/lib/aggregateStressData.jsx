export function aggregateStressData(flatData) {
  // flatData is array of { date, level, count }
  // Output array of { day, normal, low, medium, high }

  const map = {};

  flatData.forEach(({ date, level, count }) => {
    if (!map[date]) {
      map[date] = { day: date, normal: 0, low: 0, medium: 0, high: 0 };
    }
    const lvl = level.toLowerCase();
    if (map[date][lvl] !== undefined) {
      map[date][lvl] += count;
    }
  });

  // Return sorted array by date
  return Object.values(map).sort((a, b) => new Date(a.day) - new Date(b.day));
}
