import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';
import styled from 'styled-components';
import round from 'lodash/round';

import getDreamShape, { order } from './getDreamShape';

const Relatvie = styled.div`
  position: relative;
`;

const numberFormat = (num) => round(num, 2);

export default class DreamShape extends PureComponent {
  static propTypes = {
    score: PropTypes.shape(),
    fill: PropTypes.bool,
    size: PropTypes.number,
    color: PropTypes.string,
    circle: PropTypes.bool,
  }

  state = {
    rotation: 0,
    plot: [],
  }

  componentDidMount() {
    const { score, size, circle } = this.props;
    this.draw = SVG(this.container).viewbox(0, 0, size, size);
    if (circle) this.drawCirle();
    this.drawTriangle(getDreamShape(score, size));
  }

  drawTriangle = ({ alpha, rotation, plot, centroid, centroidInPolar, center }) => {
    const { color, score } = this.props;
    // draw triangle
    let shape = this.shape;
    if (this.state.plot !== plot) {
      shape = this.shape ? shape.animate(500).plot(plot) : this.draw.polygon(plot);
    }
    this.shape = shape.animate(150).attr({
      fill: color,
      opacity: alpha,
    });
    this.center = this.draw.circle(1).attr({
      cx: center[0],
      cy: center[1],
    });
    this.centroid = this.draw.circle(1).attr({
      fill: 'red',
      cx: centroid[0],
      cy: centroid[1],
    });
    this.centroidText = this.draw.text([
      numberFormat(centroidInPolar[0]),
      numberFormat(centroidInPolar[1]) + '°'
    ].join()).attr({
      x: centroid[0],
      y: centroid[1],
    }).font({
      size: 5,
      anchor: 'middle',
    });
    order.map((key, i) => this.draw.text(`${key} ${numberFormat(score[key])}`).attr({
      x: plot[i][0],
      y: plot[i][1] - (i === 0 ? 16 : 0),
    }).font({
      size: 6,
      anchor: 'middle',
    }));
    this.setState({ rotation, plot });
  }

  drawCirle = () => {
    const { size } = this.props;
    const center = size / 2;
    const attr = {
      stroke: 'black',
      fill: 'none',
      opacity: 0.1,
      cx: center,
      cy: center,
    };
    const dotFive = size / 6;
    this.draw.circle(dotFive).attr(attr);
    this.draw.circle(dotFive * 2).attr(attr);
  }

  render() {
    const { fill, score, ...props } = this.props;
    return (
      <Relatvie {...props} innerRef={(ref) => (this.container = ref)} />
    );
  }
}
