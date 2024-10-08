import { Button, IconButton, Menu } from '@affine/component';
import { SettingHeader } from '@affine/component/setting-components';
import { useWorkspaceInfo } from '@affine/core/components/hooks/use-workspace-info';
import type { PageInfoCustomPropertyMeta } from '@affine/core/modules/properties/services/schema';
import { Trans, useI18n } from '@affine/i18n';
import { DeleteIcon, MoreHorizontalIcon } from '@blocksuite/icons/rc';
import {
  type DocCustomPropertyInfo,
  DocsService,
  FrameworkScope,
  useLiveData,
  useService,
  type WorkspaceMetadata,
} from '@toeverything/infra';
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useWorkspace } from '../../../../../components/hooks/use-workspace';
import type { DocPropertyIconName } from '../../../page-properties';
import { docPropertyIconNameToIcon } from '../../../page-properties';
import { ConfirmDeletePropertyModal } from '../../../page-properties/confirm-delete-property-modal';
import { CreatePropertyMenuItems } from '../../../page-properties/menu/create-doc-property';
import type { MenuItemOption } from '../../../page-properties/menu-items';
import { renderMenuItemOptions } from '../../../page-properties/menu-items';
import * as styles from './styles.css';

// @ts-expect-error this should always be set
const managerContext = createContext<PagePropertiesMetaManager>();

const Divider = () => {
  return <div className={styles.divider} />;
};

const EditPropertyButton = ({
  property,
}: {
  property: DocCustomPropertyInfo;
}) => {
  const t = useI18n();
  const manager = useContext(managerContext);
  const [localPropertyMeta, setLocalPropertyMeta] = useState(() => ({
    ...property,
  }));
  useEffect(() => {
    setLocalPropertyMeta(property);
  }, [property]);
  const handleToggleRequired = useCallback(() => {
    manager.updatePropertyMeta(localPropertyMeta.id, {
      required: !localPropertyMeta.required,
    });
  }, [manager, localPropertyMeta.id, localPropertyMeta.required]);
  const handleDelete = useCallback(() => {
    manager.removePropertyMeta(localPropertyMeta.id);
  }, [manager, localPropertyMeta.id]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleFinishEditing = useCallback(() => {
    setOpen(false);
    setEditing(false);
    manager.updatePropertyMeta(localPropertyMeta.id, localPropertyMeta);
  }, [localPropertyMeta, manager]);

  const defaultMenuItems = useMemo(() => {
    const options: MenuItemOption[] = [];
    options.push({
      text: t['com.affine.settings.workspace.properties.set-as-required'](),
      onClick: handleToggleRequired,
      checked: localPropertyMeta.required,
    });
    options.push('-');
    options.push({
      text: t['com.affine.settings.workspace.properties.edit-property'](),
      onClick: e => {
        e.preventDefault();
        setEditing(true);
      },
    });
    options.push({
      text: t['com.affine.settings.workspace.properties.delete-property'](),
      onClick: () => setShowDeleteModal(true),
      type: 'danger',
      icon: <DeleteIcon />,
    });
    return renderMenuItemOptions(options);
  }, [handleToggleRequired, localPropertyMeta.required, t]);

  const handleNameBlur = useCallback(
    (e: string) => {
      manager.updatePropertyMeta(localPropertyMeta.id, {
        name: e,
      });
    },
    [manager, localPropertyMeta.id]
  );
  const handleNameChange = useCallback((e: string) => {
    setLocalPropertyMeta(prev => ({
      ...prev,
      name: e,
    }));
  }, []);
  const handleIconChange = useCallback(
    (icon: DocPropertyIconName) => {
      setLocalPropertyMeta(prev => ({
        ...prev,
        icon,
      }));
      manager.updatePropertyMeta(localPropertyMeta.id, {
        icon,
      });
    },
    [localPropertyMeta.id, manager]
  );
  const editMenuItems = useMemo(() => {
    const options: MenuItemOption[] = [];
    options.push(
      <EditPropertyNameMenuItem
        property={localPropertyMeta}
        onIconChange={handleIconChange}
        onNameBlur={handleNameBlur}
        onNameChange={handleNameChange}
      />
    );
    options.push(<PropertyTypeMenuItem property={localPropertyMeta} />);
    options.push('-');
    options.push({
      text: t['com.affine.settings.workspace.properties.delete-property'](),
      onClick: handleDelete,
      type: 'danger',
      icon: <DeleteIcon />,
    });
    return renderMenuItemOptions(options);
  }, [
    handleDelete,
    handleIconChange,
    handleNameBlur,
    handleNameChange,
    localPropertyMeta,
    t,
  ]);

  return (
    <>
      <Menu
        rootOptions={{
          open,
          onOpenChange: handleFinishEditing,
        }}
        items={editing ? editMenuItems : defaultMenuItems}
        contentOptions={{
          align: 'end',
          sideOffset: 4,
        }}
      >
        <IconButton onClick={() => setOpen(true)} size="20">
          <MoreHorizontalIcon />
        </IconButton>
      </Menu>
      <ConfirmDeletePropertyModal
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDelete();
        }}
        onCancel={() => setShowDeleteModal(false)}
        show={showDeleteModal}
        property={property}
      />
    </>
  );
};

const CustomPropertyRow = ({
  property,
}: {
  property: DocCustomPropertyInfo;
}) => {
  const Icon = docPropertyIconNameToIcon(property.icon, property.type);
  const t = useI18n();
  return (
    <div
      className={styles.propertyRow}
      data-property-id={property.id}
      data-testid="custom-property-row"
    >
      <Icon className={styles.propertyIcon} />
      <div data-unnamed={!property.name} className={styles.propertyName}>
        {property.name || t['unnamed']()}
      </div>
      <div className={styles.spacer} />
      <EditPropertyButton property={property} />
    </div>
  );
};

const CustomPropertyRows = ({
  properties,
}: {
  properties: DocCustomPropertyInfo[];
}) => {
  return (
    <div className={styles.metaList}>
      {properties.map(property => {
        return (
          <Fragment key={property.id}>
            <CustomPropertyRow property={property} />
            <Divider />
          </Fragment>
        );
      })}
    </div>
  );
};

const CustomPropertyRowsList = () => {
  const docsService = useService(DocsService);
  const properties = useLiveData(docsService.propertyList.sortedProperties$);
  const t = useI18n();

  return (
    <>
      <div className={styles.subListHeader}>
        {t['com.affine.settings.workspace.properties.header.title']()}
      </div>
      <CustomPropertyRows properties={properties} />
    </>
  );
};

const WorkspaceSettingPropertiesMain = () => {
  const t = useI18n();

  return (
    <div className={styles.main}>
      <div className={styles.listHeader}>
        <Menu items={<CreatePropertyMenuItems />}>
          <Button variant="primary">
            {t['com.affine.settings.workspace.properties.add_property']()}
          </Button>
        </Menu>
      </div>
      <CustomPropertyRowsList />
    </div>
  );
};

const WorkspaceSettingPropertiesInner = () => {
  const manager = usePagePropertiesMetaManager();
  return (
    <managerContext.Provider value={manager}>
      <WorkspaceSettingPropertiesMain />
    </managerContext.Provider>
  );
};

export const WorkspaceSettingProperties = ({
  workspaceMetadata,
}: {
  workspaceMetadata: WorkspaceMetadata;
}) => {
  const t = useI18n();
  const workspace = useWorkspace(workspaceMetadata);
  const workspaceInfo = useWorkspaceInfo(workspaceMetadata);
  const title = workspaceInfo?.name || 'untitled';

  if (workspace === null) {
    return null;
  }

  return (
    <FrameworkScope scope={workspace.scope}>
      <SettingHeader
        title={t['com.affine.settings.workspace.properties.header.title']()}
        subtitle={
          <Trans
            values={{
              name: title,
            }}
            i18nKey="com.affine.settings.workspace.properties.header.subtitle"
          >
            Manage workspace <strong>name</strong> properties
          </Trans>
        }
      />
      <WorkspaceSettingPropertiesInner />
    </FrameworkScope>
  );
};
