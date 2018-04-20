import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';

import all from './all.json';

const galaxies = [
  'assistance',
  'career',
  'change',
  'happiness',
  'health',
  'knowledge',
  'other',
  'selfFullment',
  'spirit',
];

const galaxiesData = groupBy(all, '分類');

const getAvg = (data) => {
  const length = data.length;
  return data.reduce((avg, d) => mapValues(d, (value, key) => (value / length) + avg[key] || 0), {});
}

export default galaxies.map((name) => {
  const data = galaxiesData[name].filter((d) => d['地區'] === 'TW');
  return {
    name,
    count: data.length,
    size: 200,
    avg: getAvg(data),
    data: data,
  };
});
