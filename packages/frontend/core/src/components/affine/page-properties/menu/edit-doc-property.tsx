import { MenuSeparator } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { DocsService, useService } from '@toeverything/infra';

import * as styles from './edit-doc-property.css';

export const EditDocPropertyMenuItems = ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const propertyList = docsService.propertyList;

  return (
    <>
      <div role="heading" className={styles.menuHeader}>
        {t['com.affine.page-properties.create-property.menu.header']()}
      </div>
      <MenuSeparator />
      {newPropertyTypes.map(type => {
        const iconName = getDefaultIconName(type);
        const Icon = docPropertyIconNameToIcon(iconName, type);
        const name = t[`com.affine.page-properties.property.${type}`]();
        return (
          <MenuItem
            key={type}
            prefixIcon={<Icon />}
            onClick={() => {
              onAddProperty({
                icon: iconName,
                name: name,
                type: type,
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
