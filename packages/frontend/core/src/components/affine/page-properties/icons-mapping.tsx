import * as icons from '@blocksuite/icons/rc';
import type { SVGProps } from 'react';

type IconType = (props: SVGProps<SVGSVGElement>) => JSX.Element;

// assume all exports in icons are icon Components
type LibIconComponentName = keyof typeof icons;

type fromLibIconName<T extends string> = T extends `${infer N}Icon`
  ? Uncapitalize<N>
  : never;

export const docPropertyIconNames = [
  'ai',
  'email',
  'text',
  'dateTime',
  'keyboard',
  'pen',
  'account',
  'embedWeb',
  'layer',
  'pin',
  'appearance',
  'eraser',
  'layout',
  'presentation',
  'bookmark',
  'exportToHtml',
  'lightMode',
  'progress',
  'bulletedList',
  'exportToMarkdown',
  'link',
  'publish',
  'camera',
  'exportToPdf',
  'linkedEdgeless',
  'quote',
  'checkBoxCheckLinear',
  'exportToPng',
  'linkedPage',
  'save',
  'cloudWorkspace',
  'exportToSvg',
  'localData',
  'shape',
  'code',
  'favorite',
  'localWorkspace',
  'style',
  'codeBlock',
  'file',
  'lock',
  'tag',
  'collaboration',
  'folder',
  'multiSelect',
  'tags',
  'colorPicker',
  'frame',
  'new',
  'today',
  'contactWithUs',
  'grid',
  'now',
  'upgrade',
  'darkMode',
  'grouping',
  'number',
  'userGuide',
  'databaseKanbanView',
  'image',
  'numberedList',
  'view',
  'databaseListView',
  'inbox',
  'other',
  'viewLayers',
  'databaseTableView',
  'info',
  'page',
  'attachment',
  'delete',
  'issue',
  'paste',
  'heartbreak',
  'edgeless',
  'journal',
  'payment',
  'createdEdited',
] as const satisfies fromLibIconName<LibIconComponentName>[];

export type DocPropertyIconName = (typeof docPropertyIconNames)[number];

export const getDefaultIconName = (type: string): DocPropertyIconName => {
  switch (type) {
    case 'text':
      return 'text';
    case 'tags':
      return 'tag';
    case 'date':
      return 'dateTime';
    case 'progress':
      return 'progress';
    case 'checkbox':
      return 'checkBoxCheckLinear';
    case 'number':
      return 'number';
    case 'createdBy':
      return 'createdEdited';
    case 'updatedBy':
      return 'createdEdited';
    default:
      return 'text';
  }
};

const getSafeIconName = (
  iconName?: string | null,
  type?: string
): DocPropertyIconName => {
  return docPropertyIconNames.includes(iconName as any)
    ? (iconName as DocPropertyIconName)
    : getDefaultIconName(type || 'text');
};

const nameToComponentName = (
  iconName: DocPropertyIconName
): LibIconComponentName => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${capitalize(iconName)}Icon` as LibIconComponentName;
};

export const docPropertyIconNameToIcon = (
  iconName?: string | null,
  type?: string
): IconType => {
  const Icon = icons[nameToComponentName(getSafeIconName(iconName, type))];
  if (!Icon) {
    throw new Error(`Icon ${iconName} not found`);
  }
  return Icon;
};
