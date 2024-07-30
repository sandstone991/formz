import { HeadingNode, headingBlock } from './heading';
import { paragraphBlock, paragraphNode } from './paragraph';

export const formzProsemirrorNodes = [
  HeadingNode,
  paragraphNode,
];

export const blocksRegistry = {
  heading: headingBlock,
  paragraph: paragraphBlock,
} as const;

export type BlockTypes = keyof typeof blocksRegistry;
