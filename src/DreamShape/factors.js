import { scaleLinear } from 'd3-scale';

export const scaleTriangleApex = scaleLinear()
  .domain([0, 2])
  .range([0, 1]);

export const scaleTriangleAlpha = scaleLinear()
  .domain([75, 85])
  .range([0, 1]);

export const scaleTriangleColor = scaleLinear()
  .domain([25, 75])
  .range(['#33AEB7', '#C43537']);
