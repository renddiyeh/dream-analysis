import chunk from 'lodash/chunk';
import sum from 'lodash/sum';

export default (data) => {
  const { length } = data;
  const sorted = data.sort((a, b) => b - a);
  return chunk(sorted, Math.ceil(length / 3)).map((chunked) => sum(chunked) / chunked.length);
};
