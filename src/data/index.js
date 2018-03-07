import groupBy from 'lodash/groupBy';
import sumBy from 'lodash/sumBy';

import {
  FEELING,
  DISTANCE,
  FACTORS,
  TRIES,
  ABILITY,
  EXTERNAL,
  PERSONAL,
  AGE,
  GENDER,
} from '../DreamShape/constants';

import all from './all.json';
import assistance from './assistance.json';
import career from './career.json';
import change from './change.json';
import happiness from './happiness.json';
import health from './health.json';
import knowledge from './knowledge.json';
import other from './other.json';
import selfFullment from './self-fullment.json';
import spirit from './spirit.json';

const data = {
  assistance,
  career,
  change,
  happiness,
  health,
  knowledge,
  other,
  selfFullment,
  spirit,
};

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

const factors = [
  ABILITY,
  EXTERNAL,
  PERSONAL,
];

const keys = [
  FEELING,
  DISTANCE,
  TRIES,
  AGE,
  GENDER,
];

const galaxiesData = groupBy(all, '分類');

const transformer = (data, desiredKey) => data.filter((d) => d.key === desiredKey).reduce((obj, d) => {
  keys.forEach((key) => {
    obj[key] = d[key];
  });
  const f = obj[FACTORS] || {};
  factors.forEach((key) => {
    f[key] = d[key];
  });
  obj[FACTORS] = f;
  return obj;
}, {})

export default galaxies.map((name) => {
  const d = data[name];
  return {
    name,
    count: galaxiesData[name].length,
    size: 200 || Math.sqrt(galaxiesData[name].length) * 10,
    avg: transformer(d, '平均數'),
    data: galaxiesData[name],
    // quantiles: factors.reduce((obj, key) => Object.assign(obj, { [key]: quantiles(galaxiesData[name].map((d) => d[key])) }), {}),
  };
});
