import { scaleLinear } from 'd3-scale';
import coordinates from 'coordinate-systems';
import getcentroid from 'triangle-centroid';

import {
  FEELING,
  GENDER,
  FACTORS,
  TRIES,
  ABILITY,
  EXTERNAL,
  PERSONAL,
} from './constants';
import { scaleTriangleAlpha, scaleTriangleColor, scaleTriangleApex } from './factors';
import arrayAdd from '../utils/arrayAdd';

export const order = [ABILITY, EXTERNAL, PERSONAL];

const surveyFuncs = {
  [FEELING]: (score) => ({ alpha: scaleTriangleAlpha(score) }),
  // [GENDER]: (score) => ({ color: scaleTriangleColor(score) }),
  [FACTORS]: (score) => {
    let factors = {
      [ABILITY]: 1,
      [EXTERNAL]: 1,
      [PERSONAL]: 1,
    };

    factors = Object.keys(score)
      .reduce((acc, cur) => {
        const value = score[cur];
        acc[cur] = scaleTriangleApex(value);

        return acc;
      }, factors);

    return { factors };
  },
  [TRIES]: () => ({ rotation: 0.008 }),
};

const getParameter = (score) => Object.keys(score)
  .reduce((acc, key) => {
    const func = surveyFuncs[key];
    if (func) {
      return {
        ...acc,
        ...func(score[key]),
      };
    }
    return acc;
  }, {});

export default (score, size = 50, c, rotation = 0) => {
  const props = getParameter(score);
  const { factors } = props;
  const triangleSide = size / 3;
  const center = c || [size / 2, size / 2];
  const rds = order.map((key, index) => [triangleSide * factors[key], -90 - index * 120]);
  const plot = rds.map((coords) => {
    const cart = coordinates.polar({
      coords,
      isDegree: true,
    }).cart();
    return arrayAdd(cart, center);
  });
  const centroid = getcentroid(plot);
  const centroidInPolar = coordinates.cart([centroid[0] - center[0], centroid[1] - center[1]]).polar();
  return {
    ...props,
    center,
    plot,
    centroid,
    centroidInPolar: [centroidInPolar[0] / (size / 3) * 100, centroidInPolar[1] / (Math.PI / 2) * 180],
  };
};
