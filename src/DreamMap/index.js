import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';
import coordinates from 'coordinate-systems';
import getcentroid from 'triangle-centroid';
import round from 'lodash/round';

import { order } from '../DreamShape/getDreamShape';
import {
  FACTORS,
} from '../DreamShape/constants';
import arrayAdd from '../utils/arrayAdd';

const parsePolar = (coords) => coordinates.polar({
  coords,
  isDegree: true,
}).cart();

export default class DreamMap extends PureComponent {
  static propTypes = {
    score: PropTypes.shape(),
    fill: PropTypes.bool,
    size: PropTypes.number,
    color: PropTypes.string,
    circle: PropTypes.bool,
  }

  static defaultProps = {
    size: 800,
  }

  constructor(props) {
    super(props);
    this.center = props.size / 2;
    this.cp = [this.center, this.center];
    this.amplifyBase = props.size * 5;
  }

  componentDidMount() {
    const { data, size } = this.props;
    this.draw = SVG(this.container).viewbox(0, 0, size, size);
    this.drawCirle();
    this.drawAxis();
    data.forEach(this.parseScore);
  }

  parseScore = ({ avg: score, name }) => {
    const { size } = this.props;
    const factors = score[FACTORS];

    // draw centroids
    const rds = order.map((key, index) => [factors[key], -90 - index * 120]);
    const plot = rds.map(parsePolar);
    const centroid = getcentroid(plot);
    const [r, theta] = coordinates.cart(centroid).polar();
    const amplifiedCentro = [r * this.amplifyBase, theta];
    console.log([r, theta / (Math.PI / 2) * 180]);
    const amplifiedCentroCart = arrayAdd(coordinates.polar(amplifiedCentro).cart(), this.cp);
    this.draw.circle(5).attr({
      cx: amplifiedCentroCart[0],
      cy: amplifiedCentroCart[1],
    });
    this.draw.text(name).attr({
      x: amplifiedCentroCart[0],
      y: amplifiedCentroCart[1],
    }).font({
      size: 12,
      anchor: 'middle',
    });
  }

  drawAxis = () => {
    // draw axis
    const rdsBase = order.map((key, index) => [this.center, -90 - index * 120]);
    const axisPlot = rdsBase.map(parsePolar).map((coord) => arrayAdd(this.cp, coord));
    axisPlot.forEach(([x, y]) => this.draw.line(this.center, this.center, x, y).stroke({ width: 1 }).attr({ opacity: 0.2 }));
  }

  drawCirle = () => {
    const { size } = this.props;
    const attr = {
      stroke: 'black',
      fill: 'none',
      opacity: 0.1,
      cx: this.center,
      cy: this.center,
    };
    const dotFive = size / 6;
    for (let i = 1; i <= 6; i += 1) {
      this.draw.circle(dotFive * i).attr(attr);
    }
  }

  render() {
    const { size } = this.props;
    return (
      <div style={{ width: size }} ref={(ref) => (this.container = ref)} />
    );
  }
}
