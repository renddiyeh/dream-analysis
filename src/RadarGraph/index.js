
import React, { Component, PropTypes } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import theme from 'theme';
import messages from './messages';

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const Box = styled.div`
  position: relative;
  padding-top: 90%;
`;

const GraphWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 40%;
  transform: translateY(-50%);
`;

const Title = styled.h2`
  color: ${theme.primaryColor};
  padding-bottom: 0.25em;
  font-size: 1.4em;
  border-bottom: 2px solid ${theme.primaryColor};
  display: inline-block;
  margin: 0 1rem;
  font-family: ${({ en }) => en && theme.digitFont};
`;

const getFill = (i) => {
  if (i === 2) return theme.primaryFadedColor;
  if (i === 1) return theme.primaryColor;
  return 'white';
};

class RadarGraph extends Component {
  static propTypes = {
    width: PropTypes.number,
    data: PropTypes.array.isRequired,
    factors: PropTypes.object.isRequired,
    factorKeys: PropTypes.array.isRequired,
  }

  static contextTypes = {
    intl: PropTypes.shape({
      formatMessage: PropTypes.func,
      locale: PropTypes.string,
    }),
  }

  componentDidMount() {
    const {
      width,
      data,
      factorKeys,
      factors,
    } = this.props;
    const { intl: { formatMessage, locale } } = this.context;
    const isEn = locale === 'en';
    this.em = parseFloat(getComputedStyle(this.container).fontSize);

    const newWidth = width || this.meter.offsetWidth;
    this.setupOptions(newWidth);

    const svg = d3.select(this.container)
      .append('svg')
      .attr('viewbox', `0 0 ${newWidth} ${newWidth}`)
      .attr('width', '100%')
      .attr('style', 'overflow: visible;');

    const g = svg.append('g')
      .attr('transform', `translate(${newWidth / 2}, ${this.height / 2})`);

    const arcRadius = this.radius * 1.3;
    const arcLenth = 2 * Math.PI * arcRadius;
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', arcRadius)
      .attr('fill', theme.background)
      .attr('stroke', theme.primaryColor)
      .attr('stroke-width', 1);
    this.arc = g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', arcRadius)
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .attr('stroke', theme.primaryColor)
      .attr('stroke-width', 4)
      .attr('stroke-dasharray', arcLenth)
      .attr('stroke-dashoffset', arcLenth * 0.8)
      .attr('stroke-linecap', 'round');

    const tickCount = 120;
    const tickStart = this.radius + 8;
    const tickLength = 4;
    const ticks = g.append('g');
    const rotateScale = d3.scaleLinear()
      .range([0, 360])
      .domain([0, tickCount]);
    ticks.selectAll('.tick')
      .data(d3.range(0, tickCount)).enter()
      .append('line')
      .attr('class', 'tick')
      .attr('stroke', 'white')
      .attr('opacity', 0.5)
      .attr('stroke-width', 1)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', tickStart)
      .attr('y2', tickStart + tickLength)
      .attr('transform', (d) => `rotate(${rotateScale(d)})`);

    const smallRadius = 6;
    this.smallCircleOrange = g.append('circle')
      .attr('cx', this.radius - smallRadius)
      .attr('cy', this.radius - smallRadius)
      .attr('r', smallRadius)
      .attr('fill', theme.primaryColor);

    // draw circular grid
    const axisGrid = g.append('g');

    axisGrid.selectAll('.levels')
      .data(d3.range(1, 4))
      .enter()
      .append('circle')
      .attr('r', (d) => (this.radius / this.levels) * d)
      .style('fill', 'none')
      .style('opacity', 0.5)
      .style('stroke', this.strokeColor)
      .style('stroke-width', this.strokeWidth);

    // draw the axes
    const axis = axisGrid.selectAll('.axis')
      .data(factorKeys)
      .enter()
      .append('g');

    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (_, i) => (
        this.scaleFunc(this.maxValue) *
        Math.cos((this.angleSlice * i) - (Math.PI / 2))
      ))
      .attr('y2', (_, i) => (
        this.scaleFunc(this.maxValue) *
        Math.sin((this.angleSlice * i) - (Math.PI / 2))
      ))
      .style('stroke', this.strokeColor)
      .style('stroke-width', this.strokeWidth)
      .style('opacity', 0.5);

    axis.append('polyline')
      .attr('points', (d, i) => {
        const startX = this.scaleFunc(factors[d] + 1.2)
          * Math.cos((this.angleSlice * i) - (Math.PI / 2));
        const startY = this.scaleFunc(factors[d] + 1.2)
          * Math.sin((this.angleSlice * i) - (Math.PI / 2));
        const end = [
          this.graphLabels[i].dx + this.lableLinkOffset[i].x,
          this.graphLabels[i].dy + this.lableLinkOffset[i].y,
        ];
        const diffX = end[0] - startX;
        const diffY = end[1] - startY;
        const midPoint = (() => {
          const sX = Math.sign(diffX);
          const absX = Math.abs(diffX);
          const sY = Math.sign(diffY);
          const absY = Math.abs(diffY);
          if (absX > absY) {
            if (sY < 0) {
              return [
                startX + (absY * sX),
                end[1],
              ];
            }
            return [
              end[0] - (absY * sX),
              startY,
            ];
          }
          return [
            end[0],
            startY + (absX * sY),
          ];
        })();
        return `${startX},${startY} ${midPoint.join(',')} ${end.join(',')}`;
      })
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('opacity', 0.5);

    const factorGroup = axis.append('g')
      .attr('transform', (_, i) => `translate(${this.graphLabels[i].dx} ${this.graphLabels[i].dy})`);
    factorGroup.append('text')
      .style('fill', '#FFF')
      .style('font-size', isEn ? '1em' : '1.25em')
      .style('font-family', isEn ? theme.digitFont : theme.fontFamily)
      .attr('x', 0)
      .attr('y', 0)
      .text((d) => formatMessage(messages[d]));
    const factorMeter = factorGroup.append('g');
    const meterSize = { width: 3, height: 8 };
    const metterPadding = { top: 4, left: 4 };
    const meterRatio = 2;
    factorMeter.append('rect')
      .attr('x', 0)
      .attr('y', meterSize.height)
      .attr('width', this.pxToEm((12 * meterSize.width * meterRatio) + (metterPadding.left * 2)))
      .attr('height', this.pxToEm((metterPadding.top * 2) + meterSize.height))
      .attr('fill', 'white')
      .attr('opacity', 0.3);
    d3.range(0, 12).forEach((i) => {
      factorMeter
        .append('rect')
        .attr('x', this.pxToEm(metterPadding.left + (i * meterSize.width * meterRatio)))
        .attr('y', this.pxToEm(metterPadding.top + meterSize.height))
        .attr('width', this.pxToEm(meterSize.width))
        .attr('height', this.pxToEm(meterSize.height))
        .attr('fill', (d) => (i < (factors[d] + 1) * 4 ? theme.primaryColor : 'rgba(255, 255, 255, 0.5)'));
    });

    // draw the radar chart
    const radarLine = d3.radialLine()
      .radius((d) => this.scaleFunc(d.value))
      .angle((d, i) => i * this.angleSlice);

    const blobWrapper = g.selectAll('.radarWrapper')
      .data(data)
      .enter().append('g');

    blobWrapper
      .append('path')
      .attr('class', 'radarArea')
      .attr('d', (d) => radarLine(d))
      .style('fill', (d, index) => getFill(index))
      .style('fill-opacity', 0.7);

    this.timer = d3.timer(this.update);
  }

  componentWillUnmount() {
    this.timer.stop();
  }

  setupOptions(width) {
    const {
      factorKeys,
    } = this.props;

    this.height = width;
    this.strokeWidth = 0.5;
    this.strokeColor = '#FFFFFF';
    this.radius = ((width / 2) - (this.strokeWidth / 2)) * 0.5;
    this.levels = 3;
    this.maxValue = 3;
    this.scaleFunc = d3.scaleLinear()
      .domain([0, 3])
      .range([0, this.radius]);
    this.labelFactor = 1.25;

    this.graphLabels = [
      { dx: this.radius * 1.1, dy: -this.radius * 1.2 },
      { dx: this.radius * 1.1, dy: this.radius * 1.2 },
      { dx: -this.radius * 1.7, dy: this.radius * 1.2 },
    ];

    this.lableLinkOffset = [
      { x: -6, y: -8 },
      { x: 16 * 1.25 * 1.5, y: -20 },
      { x: 16 * 1.25 * 1.5, y: -20 },
    ];

    this.angleSlice = (Math.PI * 2) / factorKeys.length;
  }

  update = (elapsed) => {
    this.arc.attr('transform', `rotate(${((elapsed / 20) * 3.5) % 360})`);
    this.smallCircleOrange.attr('transform', `rotate(-${((elapsed / 20) * 2.5) % 360})`);
  }

  pxToEm = (px) => `${px / this.em}em`

  render() {
    return (
      <Wrapper>
        <Title en={this.context.intl.locale === 'en'}><FormattedMessage {...messages.title} /></Title>
        <Box innerRef={(dom) => (this.meter = dom)}>
          <GraphWrapper innerRef={(dom) => (this.container = dom)} />
        </Box>
      </Wrapper>
    );
  }
}

export default RadarGraph;
