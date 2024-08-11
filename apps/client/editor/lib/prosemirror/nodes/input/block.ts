import type { FormBlockConfig } from '~/editor/lib/interface';

export const inputBlock: FormBlockConfig = {
  nodeType: 'input',
  title: 'Input',
  icon: 'icon-[radix-icons--input]',
  placeholder: 'Input',
  form: [
    {
      type: 'switch',
      label: 'Default Answer',
      path: 'defaultAnswerEnabled',
    },
    {
      type: 'input',
      path: 'defaultAnswer',
      hidden: ({ form }) => !form.defaultAnswerEnabled,
    },
  ],
};
