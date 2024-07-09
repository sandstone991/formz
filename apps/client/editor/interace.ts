export interface FormzBlock {
  type: 'block'
  element: FormzElement
}

export interface EmptyRow {
  id: string
  type: 'empty'
}

export type BasicBlock = EmptyRow | FormzBlock;

export type FormzRow = { id: string } & BasicBlock;

export type FormzFlexBlock = {
  rows: BasicBlock[]
  columnCount: number
  columnnPercentages: number[]
};

export type FormzLayout = (FormzRow | FormzFlexBlock)[];

export interface FormzElement {
  type: FormzElementTypes
  id: string
  props: Record<string, unknown>
}

type FormzElementTypes = 'shortInput';
