import { MenuItem, MenuSeparator } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { DocsService, useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { type DocPropertyType, DocPropertyTypes } from '../types/constant';
import * as styles from './create-doc-property.css';

const findNextDefaultName = (name: string, allNames: string[]): string => {
  const nameExists = allNames.includes(name);
  if (nameExists) {
    const match = name.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const nextName = name.replace(/(\d+)$/, `${num + 1}`);
      return findNextDefaultName(nextName, allNames);
    } else {
      return findNextDefaultName(`${name} 2`, allNames);
    }
  } else {
    return name;
  }
};

export const CreatePropertyMenuItems = () => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const propertyList = docsService.propertyList;

  const onAddProperty = useCallback(
    (option: { type: DocPropertyType; name: string }) => {
      const properties = propertyList.properties$.value;
      const nameExists = properties.some(meta => meta.name === option.name);
      const allNames = properties
        .map(meta => meta.name)
        .filter((name): name is string => name !== null && name !== undefined);
      const name = nameExists
        ? findNextDefaultName(option.name, allNames)
        : option.name;
      propertyList.createProperty({
        name,
        type: option.type,
        index: propertyList.indexAt('before'),
      });
    },
    [propertyList]
  );

  return (
    <>
      <div role="heading" className={styles.menuHeader}>
        {t['com.affine.page-properties.create-property.menu.header']()}
      </div>
      <MenuSeparator />
      {Object.entries(DocPropertyTypes).map(([type, info]) => {
        const name =
          t[`com.affine.page-properties.property.${type as DocPropertyType}`]();
        const Icon = info.icon;
        return (
          <MenuItem
            key={type}
            prefixIcon={<Icon />}
            onClick={() => {
              onAddProperty({
                name: name,
                type: type as DocPropertyType,
              });
            }}
          >
            {name}
          </MenuItem>
        );
      })}
    </>
  );
};
