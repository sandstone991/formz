import Checkbox from './controls/Checkbox.vue';
import Input from './controls/Input.vue';
import Switch from './controls/Switch.vue';

export const formControlRegistery = {
  input: Input,
  checkbox: Checkbox,
  switch: Switch,
} as const;
