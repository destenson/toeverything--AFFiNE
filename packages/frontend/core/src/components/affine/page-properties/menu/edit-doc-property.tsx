import {
  Input,
  MenuItem,
  MenuSeparator,
  useConfirmModal,
} from '@affine/component';
import { Trans, useI18n } from '@affine/i18n';
import { DeleteIcon } from '@blocksuite/icons/rc';
import { DocsService, useLiveData, useService } from '@toeverything/infra';
import {
  type KeyboardEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { DocPropertyIcon } from '../icons/doc-property-icon';
import { DocPropertyIconSelector } from '../icons/icons-selector';
import { isSupportedDocPropertyType } from '../types/constant';
import * as styles from './edit-doc-property.css';

export const EditDocPropertyMenuItems = ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const propertyInfo = useLiveData(
    docsService.propertyList.propertyInfo$(propertyId)
  );
  const propertyType = propertyInfo?.type;
  const [name, setName] = useState(propertyInfo?.name ?? '');
  const confirmModal = useConfirmModal();

  useEffect(() => {
    setName(propertyInfo?.name ?? '');
  }, [propertyInfo?.name]);

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key !== 'Escape') {
        e.stopPropagation();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        docsService.propertyList.updatePropertyInfo(propertyId, {
          name: e.currentTarget.value,
        });
      }
    },
    [docsService.propertyList, propertyId]
  );
  const handleBlur = useCallback(
    (e: FocusEvent & { currentTarget: HTMLInputElement }) => {
      docsService.propertyList.updatePropertyInfo(propertyId, {
        name: e.currentTarget.value,
      });
    },
    [docsService.propertyList, propertyId]
  );

  const handleIconChange = useCallback(
    (iconName: string) => {
      docsService.propertyList.updatePropertyInfo(propertyId, {
        icon: iconName,
      });
    },
    [docsService.propertyList, propertyId]
  );

  const handleNameChange = useCallback((e: string) => {
    setName(e);
  }, []);

  if (!propertyInfo || !isSupportedDocPropertyType(propertyType)) {
    return null;
  }

  return (
    <>
      <div className={styles.propertyRowNamePopupRow}>
        <DocPropertyIconSelector
          propertyInfo={propertyInfo}
          onSelectedChange={handleIconChange}
        />
        <Input
          value={name}
          onBlur={handleBlur}
          onChange={handleNameChange}
          placeholder={t['unnamed']()}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className={styles.propertyRowTypeItem}>
        {t['com.affine.page-properties.create-property.menu.header']()}
        <div className={styles.propertyTypeName}>
          <DocPropertyIcon propertyInfo={propertyInfo} />
          {t[`com.affine.page-properties.property.${propertyType}`]()}
        </div>
      </div>
      <MenuSeparator />
      <MenuItem
        prefixIcon={<DeleteIcon />}
        type="danger"
        onClick={() => {
          confirmModal.openConfirmModal({
            title:
              t['com.affine.settings.workspace.properties.delete-property'](),
            description: (
              <Trans
                values={{
                  name: propertyInfo.name,
                }}
                i18nKey="com.affine.settings.workspace.properties.delete-property-desc"
              >
                The <strong>{{ name: propertyInfo.name } as any}</strong>{' '}
                property will be removed from count doc(s). This action cannot
                be undone.
              </Trans>
            ),
            confirmText: t['Confirm'](),
            onConfirm: () => {
              docsService.propertyList.removeProperty(propertyId);
            },
            confirmButtonOptions: {
              variant: 'error',
            },
          });
        }}
      >
        {t['com.affine.settings.workspace.properties.delete-property']()}
      </MenuItem>
    </>
  );
};
