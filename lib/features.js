export const features = [
  {
    id: 'timer',
    title: '護眼專注',
    desc: '20/20/20 計時器',
    iconPaths: [
      'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z',
      'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    ],
    accent: '#3EE0A0',
    available: true,
  },
  {
    id: 'portfolio-tracker',
    title: '資產配置',
    desc: '投資組合分析',
    iconPaths: [
      'M4 19.5h16',
      'M4 19.5V5',
      'M6 16l4-5 4 3 4-6',
      'M6 16h.01',
      'M10 11h.01',
      'M14 14h.01',
      'M18 8h.01',
    ],
    accent: '#6AA7FF',
    available: true,
  },
  {
    id: 'calendar',
    title: '習慣追蹤',
    desc: '建立與維持習慣',
    iconPaths: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
    accent: '#B88BFF',
    available: false,
  },
  {
    id: 'tools',
    title: '筆記本',
    desc: '快速記錄想法',
    iconPaths: [
      'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V5H6.5A2.5 2.5 0 0 0 4 7.5v12z',
      'M12 9h4',
      'M12 13h4',
    ],
    accent: '#F0C94B',
    available: false,
  },
];

export const getFeatureById = (id) => features.find((f) => f.id === id);
