import { Button, IconButton, Menu } from '@affine/component';
import { SettingHeader } from '@affine/component/setting-components';
import { useWorkspaceInfo } from '@affine/core/components/hooks/use-workspace-info';
import { Trans, useI18n } from '@affine/i18n';
import { MoreHorizontalIcon } from '@blocksuite/icons/rc';
import {
  type DocCustomPropertyInfo,
  DocsService,
  FrameworkScope,
  useLiveData,
  useService,
  type WorkspaceMetadata,
} from '@toeverything/infra';
import { Fragment } from 'react';

import { useWorkspace } from '../../../../../components/hooks/use-workspace';
import { DocPropertyIcon } from '../../../page-properties/icons/doc-property-icon';
import { CreatePropertyMenuItems } from '../../../page-properties/menu/create-doc-property';
import { EditDocPropertyMenuItems } from '../../../page-properties/menu/edit-doc-property';
import * as styles from './styles.css';

const Divider = () => {
  return <div className={styles.divider} />;
};

const EditPropertyButton = ({
  property,
}: {
  property: DocCustomPropertyInfo;
}) => {
  return (
    <Menu
      items={<EditDocPropertyMenuItems propertyId={property.id} />}
      contentOptions={{
        align: 'end',
        sideOffset: 4,
      }}
    >
      <IconButton size="20">
        <MoreHorizontalIcon />
      </IconButton>
    </Menu>
  );
};

const CustomPropertyRow = ({
  property,
}: {
  property: DocCustomPropertyInfo;
}) => {
  const t = useI18n();
  return (
    <div
      className={styles.propertyRow}
      data-property-id={property.id}
      data-testid="custom-property-row"
    >
      <DocPropertyIcon
        propertyInfo={property}
        className={styles.propertyIcon}
      />
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
      <WorkspaceSettingPropertiesMain />
    </FrameworkScope>
  );
};
