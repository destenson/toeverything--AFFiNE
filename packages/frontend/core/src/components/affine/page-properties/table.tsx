import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  PropertyName,
  PropertyRoot,
  Tooltip,
} from '@affine/component';
import { DocLinksService } from '@affine/core/modules/doc-link';
import { EditorSettingService } from '@affine/core/modules/editor-settting';
import { i18nTime, useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import { PlusIcon, ToggleExpandIcon } from '@blocksuite/icons/rc';
import * as Collapsible from '@radix-ui/react-collapsible';
import {
  type DocCustomPropertyInfo,
  DocService,
  DocsService,
  useLiveData,
  useService,
  useServices,
  WorkspaceService,
} from '@toeverything/infra';
import clsx from 'clsx';
import { useDebouncedValue } from 'foxact/use-debounced-value';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { AffinePageReference } from '../reference-link';
import { DocPropertyIcon } from './icons/doc-property-icon';
import { CreatePropertyMenuItems } from './menu/create-doc-property';
import { EditDocPropertyMenuItems } from './menu/edit-doc-property';
import * as styles from './styles.css';
import { DocPropertyTypes, isSupportedDocPropertyType } from './types/constant';

const Divider = () => <div className={styles.tableHeaderDivider} />;

// const VisibilityModeSelector = ({
//   property,
// }: {
//   property: PageInfoCustomProperty;
// }) => {
//   const manager = useContext(managerContext);
//   const t = useI18n();
//   const meta = manager.getCustomPropertyMeta(property.id);
//   const visibility = property.visibility || 'visible';

//   const menuItems = useMemo(() => {
//     const options: MenuItemOption[] = [];
//     options.push(
//       visibilities.map(v => {
//         const text = visibilityMenuText(v);
//         return {
//           text: t[text](),
//           selected: visibility === v,
//           onClick: () => {
//             manager.updateCustomProperty(property.id, {
//               visibility: v,
//             });
//           },
//         };
//       })
//     );
//     return renderMenuItemOptions(options);
//   }, [manager, property.id, t, visibility]);

//   if (!meta) {
//     return null;
//   }

//   const required = meta.required;

//   return (
//     <Menu
//       items={menuItems}
//       rootOptions={{
//         open: required ? false : undefined,
//       }}
//       contentOptions={{
//         onClick(e) {
//           e.stopPropagation();
//         },
//       }}
//     >
//       <div
//         role="button"
//         data-required={required}
//         className={styles.selectorButton}
//       >
//         {required ? (
//           t['com.affine.page-properties.property.required']()
//         ) : (
//           <>
//             {t[visibilitySelectorText(visibility)]()}
//             <ArrowDownSmallIcon width={16} height={16} />
//           </>
//         )}
//       </div>
//     </Menu>
//   );
// };

// export const PagePropertiesSettingsPopup = ({
//   children,
// }: PagePropertiesSettingsPopupProps) => {
//   const manager = useContext(managerContext);
//   const t = useI18n();

//   const menuItems = useMemo(() => {
//     const options: MenuItemOption[] = [];
//     options.push(
//       <div
//         role="heading"
//         className={styles.menuHeader}
//         style={{ minWidth: 320 }}
//       >
//         {t['com.affine.page-properties.settings.title']()}
//       </div>
//     );
//     options.push('-');
//     options.push([
//       <SortableProperties key="sortable-settings">
//         {properties =>
//           properties.map(property => {
//             const meta = manager.getCustomPropertyMeta(property.id);
//             assertExists(meta, 'meta should exist for property');
//             const Icon = docPropertyIconNameToIcon(meta.icon, meta.type);
//             const name = meta.name;
//             return (
//               <SortablePropertyRow
//                 key={meta.id}
//                 property={property}
//                 className={styles.propertySettingRow}
//                 data-testid="page-properties-settings-menu-item"
//               >
//                 <Icon />
//                 <div
//                   data-testid="page-property-setting-row-name"
//                   className={styles.propertyRowName}
//                 >
//                   {name}
//                 </div>
//                 <VisibilityModeSelector property={property} />
//               </SortablePropertyRow>
//             );
//           })
//         }
//       </SortableProperties>,
//     ]);
//     return renderMenuItemOptions(options);
//   }, [manager, t]);

//   return (
//     <Menu
//       contentOptions={{
//         onClick(e) {
//           e.stopPropagation();
//         },
//       }}
//       items={menuItems}
//     >
//       {children}
//     </Menu>
//   );
// };

type PageBacklinksPopupProps = PropsWithChildren<{
  backlinks: { docId: string; blockId: string; title: string }[];
}>;

export const PageBacklinksPopup = ({
  backlinks,
  children,
}: PageBacklinksPopupProps) => {
  return (
    <Menu
      contentOptions={{
        className: styles.backLinksMenu,
        onClick(e) {
          e.stopPropagation();
        },
      }}
      items={
        <div className={styles.backlinksList}>
          {backlinks.map(link => (
            <AffinePageReference
              key={link.docId + ':' + link.blockId}
              wrapper={MenuItem}
              pageId={link.docId}
            />
          ))}
        </div>
      }
    >
      {children}
    </Menu>
  );
};

interface PagePropertiesTableHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// backlinks - #no                Updated yyyy-mm-dd
// ─────────────────────────────────────────────────
// Page Info ...
export const PagePropertiesTableHeader = ({
  className,
  style,
  open,
  onOpenChange,
}: PagePropertiesTableHeaderProps) => {
  const t = useI18n();
  const {
    docLinksServices,
    docService,
    workspaceService,
    editorSettingService,
  } = useServices({
    DocLinksServices: DocLinksService,
    DocService,
    WorkspaceService,
    EditorSettingService,
  });
  const docBacklinks = docLinksServices.backlinks;
  const backlinks = useLiveData(docBacklinks.backlinks$);

  const displayDocInfo = useLiveData(
    editorSettingService.editorSetting.settings$.selector(s => s.displayDocInfo)
  );

  const { syncing, retrying, serverClock } = useLiveData(
    workspaceService.workspace.engine.doc.docState$(docService.doc.id)
  );

  const { createDate, updatedDate } = useLiveData(
    docService.doc.meta$.selector(m => ({
      createDate: m.createDate,
      updatedDate: m.updatedDate,
    }))
  );

  const timestampElement = useMemo(() => {
    const localizedCreateTime = createDate ? i18nTime(createDate) : null;

    const createTimeElement = (
      <div className={styles.tableHeaderTimestamp}>
        {t['Created']()} {localizedCreateTime}
      </div>
    );

    return serverClock ? (
      <Tooltip
        side="right"
        content={
          <>
            <div className={styles.tableHeaderTimestamp}>
              {t['Updated']()} {i18nTime(serverClock)}
            </div>
            {createDate && (
              <div className={styles.tableHeaderTimestamp}>
                {t['Created']()} {i18nTime(createDate)}
              </div>
            )}
          </>
        }
      >
        <div className={styles.tableHeaderTimestamp}>
          {!syncing && !retrying ? (
            <>
              {t['Updated']()}{' '}
              {i18nTime(serverClock, {
                relative: {
                  max: [1, 'day'],
                  accuracy: 'minute',
                },
                absolute: {
                  accuracy: 'day',
                },
              })}
            </>
          ) : (
            <>{t['com.affine.syncing']()}</>
          )}
        </div>
      </Tooltip>
    ) : updatedDate ? (
      <Tooltip side="right" content={createTimeElement}>
        <div className={styles.tableHeaderTimestamp}>
          {t['Updated']()} {i18nTime(updatedDate)}
        </div>
      </Tooltip>
    ) : (
      createTimeElement
    );
  }, [createDate, updatedDate, retrying, serverClock, syncing, t]);

  const dTimestampElement = useDebouncedValue(timestampElement, 500);

  const handleCollapse = useCallback(() => {
    track.doc.inlineDocInfo.$.toggle();
    onOpenChange(!open);
  }, [onOpenChange, open]);

  return (
    <div className={clsx(styles.tableHeader, className)} style={style}>
      {/* TODO(@Peng): add click handler to backlinks */}
      <div className={styles.tableHeaderInfoRow}>
        {backlinks.length > 0 ? (
          <PageBacklinksPopup backlinks={backlinks}>
            <div className={styles.tableHeaderBacklinksHint}>
              {t['com.affine.page-properties.backlinks']()} · {backlinks.length}
            </div>
          </PageBacklinksPopup>
        ) : null}
        {dTimestampElement}
      </div>
      <Divider />
      {displayDocInfo ? (
        <div className={styles.tableHeaderSecondaryRow}>
          <div className={clsx(!open ? styles.pageInfoDimmed : null)}>
            {t['com.affine.page-properties.page-info']()}
          </div>
          {/* {properties.length === 0 || manager.readonly ? null : (
            <PagePropertiesSettingsPopup>
              <IconButton data-testid="page-info-show-more" size="20">
                <MoreHorizontalIcon />
              </IconButton>
            </PagePropertiesSettingsPopup>
          )} */}
          <Collapsible.Trigger asChild role="button" onClick={handleCollapse}>
            <div
              className={styles.tableHeaderCollapseButtonWrapper}
              data-testid="page-info-collapse"
            >
              <IconButton size="20">
                <ToggleExpandIcon
                  className={styles.collapsedIcon}
                  data-collapsed={!open}
                />
              </IconButton>
            </div>
          </Collapsible.Trigger>
        </div>
      ) : null}
    </div>
  );
};

interface PagePropertyRowProps {
  propertyInfo: DocCustomPropertyInfo;
}

export const PagePropertyRow = ({ propertyInfo }: PagePropertyRowProps) => {
  const t = useI18n();
  const docService = useService(DocService);
  const customPropertyValue = useLiveData(
    docService.doc.customProperty$(propertyInfo.id)
  );
  const typeInfo = isSupportedDocPropertyType(propertyInfo.type)
    ? DocPropertyTypes[propertyInfo.type]
    : undefined;

  const ValueRenderer =
    typeInfo && 'value' in typeInfo ? typeInfo.value : undefined;

  const handleChange = useCallback(
    (value: any) => {
      if (typeof value !== 'string') {
        throw new Error('only allow string value');
      }
      docService.doc.record.setCustomProperty(propertyInfo.id, value);
    },
    [docService, propertyInfo]
  );

  if (!ValueRenderer || typeof ValueRenderer !== 'function') return null;

  return (
    <PropertyRoot>
      <PropertyName
        icon={<DocPropertyIcon propertyInfo={propertyInfo} />}
        name={propertyInfo.name ?? t['unnamed']()}
        menuItems={<EditDocPropertyMenuItems propertyId={propertyInfo.id} />}
      />
      <ValueRenderer
        propertyInfo={propertyInfo}
        onChange={handleChange}
        value={customPropertyValue}
      />
    </PropertyRoot>
  );
};

interface PagePropertiesTableBodyProps {
  className?: string;
  style?: React.CSSProperties;
}

// 🏷️ Tags     (⋅ xxx) (⋅ yyy)
// #️⃣ Number   123456
// +  Add a property
export const PagePropertiesTableBody = ({
  className,
  style,
}: PagePropertiesTableBodyProps) => {
  const t = useI18n();
  const docsService = useService(DocsService);
  const properties = useLiveData(docsService.propertyList.sortedProperties$);
  return (
    <Collapsible.Content
      className={clsx(styles.tableBodyRoot, className)}
      style={style}
    >
      <div className={styles.tableBodySortable}>
        {properties.map(property => (
          <PagePropertyRow key={property.id} propertyInfo={property} />
        ))}
      </div>
      <Menu
        items={<CreatePropertyMenuItems />}
        contentOptions={{
          onClick(e) {
            e.stopPropagation();
          },
        }}
      >
        <Button
          variant="plain"
          prefix={<PlusIcon />}
          className={styles.addPropertyButton}
        >
          {t['com.affine.page-properties.add-property']()}
        </Button>
      </Menu>
      <Divider />
    </Collapsible.Content>
  );
};

const DocPropertiesTableInner = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={styles.root}>
      <Collapsible.Root
        open={expanded}
        onOpenChange={setExpanded}
        className={styles.rootCentered}
      >
        <PagePropertiesTableHeader open={expanded} onOpenChange={setExpanded} />
        <PagePropertiesTableBody />
      </Collapsible.Root>
    </div>
  );
};

// this is the main component that renders the page properties table at the top of the page below
// the page title
export const DocPropertiesTable = () => {
  return <DocPropertiesTableInner />;
};
