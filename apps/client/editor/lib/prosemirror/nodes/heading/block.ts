import { HeadingNode } from './node';
import type { FormBlockConfig } from '~/editor/lib/interface';

export const heading1Block: FormBlockConfig = {
  nodeType: HeadingNode.name,
  title: 'Heading 1',
  icon: 'icon-[lucide--heading-1]',
  placeholder: 'Heading',
  initialAttrs: { level: 1 },
};

export const heading2Block: FormBlockConfig = {
  nodeType: HeadingNode.name,
  title: 'Heading 2',
  icon: 'icon-[lucide--heading-2]',
  placeholder: 'Heading',
  initialAttrs: { level: 2 },
};

export const heading3Block: FormBlockConfig = {
  nodeType: HeadingNode.name,
  title: 'Heading 3',
  icon: 'icon-[lucide--heading-3]',
  placeholder: 'Heading',
  initialAttrs: { level: 3 },
};
