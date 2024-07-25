import { HeadingNode, headingBlock } from './heading';

export const formzProsemirrorNodes = [
  HeadingNode,
];

export const blocksRegistry = {
  heading: headingBlock,
} as const;

export type BlockTypes = keyof typeof blocksRegistry;
