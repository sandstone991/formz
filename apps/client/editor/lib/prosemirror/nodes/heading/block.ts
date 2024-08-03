import { HeadingNode } from './node';
import type { QuickMenuBlock } from '~/editor/lib/interface';

export const heading1Block: QuickMenuBlock = {
  nodeType: HeadingNode.name,
  title: 'Heading 1',
  icon: 'icon-[lucide--heading-1]',
  placeholder: 'Heading',
  initialAttrs: { level: 1 },
};

export const heading2Block: QuickMenuBlock = {
  nodeType: HeadingNode.name,
  title: 'Heading 2',
  icon: 'icon-[lucide--heading-2]',
  placeholder: 'Heading',
  initialAttrs: { level: 2 },
};

export const heading3Block: QuickMenuBlock = {
  nodeType: HeadingNode.name,
  title: 'Heading 3',
  icon: 'icon-[lucide--heading-3]',
  placeholder: 'Heading',
  initialAttrs: { level: 3 },
};
