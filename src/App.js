import React, { Component } from 'react';
import styled from 'styled-components';
import sortBy from 'lodash/sortBy';

import DreamShape from './DreamShape';
import DreamMap from './DreamMap';
import data from './data';
import {
  ABILITY,
  EXTERNAL,
  PERSONAL,
  FACTORS,
  GENDER,
} from './DreamShape/constants';
import { scaleTriangleColor } from './DreamShape/factors';

const Flex = styled.div`
  display: flex;
  padding: 2em;
  flex-wrap: wrap;
  align-items: center;
`;

const Planet = styled.div`
  width: ${({ width }) => width * 2}px;
  text-align: center;
  position: relative;
`;

const Name = styled.div`
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const AbsDream = styled(DreamShape)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: ${({ opacity }) => opacity}};
`;

const list = [ABILITY, EXTERNAL, PERSONAL];

class App extends Component {
  render() {
    return (
      <Flex>
        <DreamMap data={data} />
        {sortBy(data, 'count').map(({ name, count, avg, data, size }) => (
          <Planet width={size} key={name}>
            <DreamShape
              score={avg}
              size={size}
              // fill
              color="#C43537"
              circle
            >
             {/* {data.map((d) => (
                <AbsDream
                  score={(() => {
                    const factors = list.reduce((obj, key) => Object.assign(obj, {
                      [key]: d[key],
                    }), {});
                    return { ...d, [FACTORS]: factors };
                  })()}
                  size={size}
                  key={d.ID}
                  fill
                  opacity={0.05}
                  color="#999"
                />
              ))} */}
              <Name>{name}<br />{count}</Name>
            </DreamShape>
          </Planet>
        ))}
      </Flex>
    );
  }
}

export default App;
