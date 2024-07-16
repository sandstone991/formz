import { Schema } from 'prosemirror-model';
import * as nodes from './nodes';

export const schema = new Schema({
  nodes: {
    ...nodes,
  },
});
