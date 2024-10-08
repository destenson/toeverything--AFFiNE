export const DocPropertyTypes = {
  'text': {
    icon: <TextIcon />,
  },
  'number': {
    icon: <NumberIcon />,
  },
  'date',
  'progress',
  'checkbox',
  'tags',
  'createdBy',
  'updatedBy',
} as const;

export type DocPropertyType = (typeof DocPropertyTypes)[number];
