import {
  CheckBoxCheckLinearIcon,
  CreatedEditedIcon,
  DateTimeIcon,
  NumberIcon,
  TagIcon,
  TextIcon,
} from '@blocksuite/icons/rc';

import { CheckboxValue } from './checkbox';
import { CreatedByValue, UpdatedByValue } from './created-updated-by';
import { DateValue } from './date';
import { NumberValue } from './number';
import { TagsValue } from './tags';
import { TextValue } from './text';
import type { PropertyValueProps } from './types';

export const DocPropertyTypes = {
  text: {
    icon: TextIcon,
    value: TextValue,
  },
  number: {
    icon: NumberIcon,
    value: NumberValue,
  },
  date: {
    icon: DateTimeIcon,
    value: DateValue,
  },
  checkbox: {
    icon: CheckBoxCheckLinearIcon,
    value: CheckboxValue,
  },
  createdBy: {
    icon: CreatedEditedIcon,
    value: CreatedByValue,
  },
  updatedBy: {
    icon: CreatedEditedIcon,
    value: UpdatedByValue,
  },
  tags: {
    icon: TagIcon,
    value: TagsValue,
  },
} satisfies Record<
  string,
  {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    value?: React.FC<PropertyValueProps>;
  }
>;

export type DocPropertyType = keyof typeof DocPropertyTypes;

export const isSupportedDocPropertyType = (
  type?: string
): type is DocPropertyType => {
  return type ? type in DocPropertyTypes : false;
};
