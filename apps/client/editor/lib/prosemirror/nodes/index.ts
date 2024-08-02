import { HeadingNode, headingBlock } from './heading';
import { inputBlock } from './input';
import { InputNode } from './input/node';
import { paragraphBlock, paragraphNode } from './paragraph';

export const formzProsemirrorNodes = [
  HeadingNode,
  paragraphNode,
  InputNode,
];

export const blocksRegistry = {
  heading: headingBlock,
  paragraph: paragraphBlock,
  input: inputBlock,
} as const;

export type BlockTypes = keyof typeof blocksRegistry;
