import { heading } from './blocks/heading';
import { paragraph } from './blocks/paragraph';

export const blocksRegistry = {
  paragraph,
  heading,
} as const;

export type BlockTypes = keyof typeof blocksRegistry;
