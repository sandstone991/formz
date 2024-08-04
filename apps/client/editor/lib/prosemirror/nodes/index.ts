import { HeadingNode } from './heading';
import { heading1Block, heading2Block, heading3Block } from './heading/block';
import { inputBlock } from './input';
import { InputNode } from './input/node';
import { labelBlock, labelNode } from './label';
import { paragraphBlock, paragraphNode } from './paragraph';

export const formzProsemirrorNodes = [
  HeadingNode,
  paragraphNode,
  InputNode,
  labelNode,
];

export const inputNodes = new Set([InputNode.name]);

export const blocksRegistry = {
  heading1: heading1Block,
  heading2: heading2Block,
  heading3: heading3Block,
  paragraph: paragraphBlock,
  input: inputBlock,
  label: labelBlock,
} as const;

export type BlockTypes = keyof typeof blocksRegistry;
