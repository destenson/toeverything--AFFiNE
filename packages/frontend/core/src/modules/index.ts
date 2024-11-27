import { configureQuotaModule } from '@affine/core/modules/quota';
import { configureInfraModules, type Framework } from '@toeverything/infra';

import { configureAppSidebarModule } from './app-sidebar';
import { configAtMenuConfigModule } from './at-menu-config';
import { configureCloudModule } from './cloud';
import { configureCollectionModule } from './collection';
import { configureDialogModule } from './dialogs';
import { configureDocDisplayMetaModule } from './doc-display-meta';
import { configureDocInfoModule } from './doc-info';
import { configureDocLinksModule } from './doc-link';
import { configureDocsSearchModule } from './docs-search';
import { configureEditorModule } from './editor';
import { configureEditorSettingModule } from './editor-setting';
import { configureExplorerModule } from './explorer';
import { configureFavoriteModule } from './favorite';
import { configureI18nModule } from './i18n';
import { configureImportTemplateModule } from './import-template';
import { configureJournalModule } from './journal';
import { configureNavigationModule } from './navigation';
import { configureOpenInApp } from './open-in-app';
import { configureOrganizeModule } from './organize';
import { configurePDFModule } from './pdf';
import { configurePeekViewModule } from './peek-view';
import { configurePermissionsModule } from './permissions';
import { configureQuickSearchModule } from './quicksearch';
import { configureShareDocsModule } from './share-doc';
import { configureShareSettingModule } from './share-setting';
import { configureSystemFontFamilyModule } from './system-font-family';
import { configureTagModule } from './tag';
import { configureTelemetryModule } from './telemetry';
import { configureAppThemeModule } from './theme';
import { configureThemeEditorModule } from './theme-editor';
import { configureUrlModule } from './url';
import { configureUserspaceModule } from './userspace';

export function configureCommonModules(framework: Framework) {
  configureI18nModule(framework);
  configureInfraModules(framework);
  configureCollectionModule(framework);
  configureNavigationModule(framework);
  configureTagModule(framework);
  configureCloudModule(framework);
  configureQuotaModule(framework);
  configurePermissionsModule(framework);
  configureShareDocsModule(framework);
  configureShareSettingModule(framework);
  configureTelemetryModule(framework);
  configurePDFModule(framework);
  configurePeekViewModule(framework);
  configureDocDisplayMetaModule(framework);
  configureQuickSearchModule(framework);
  configureDocsSearchModule(framework);
  configureDocLinksModule(framework);
  configureOrganizeModule(framework);
  configureFavoriteModule(framework);
  configureExplorerModule(framework);
  configureThemeEditorModule(framework);
  configureEditorModule(framework);
  configureSystemFontFamilyModule(framework);
  configureEditorSettingModule(framework);
  configureImportTemplateModule(framework);
  configureUserspaceModule(framework);
  configureAppSidebarModule(framework);
  configureJournalModule(framework);
  configureUrlModule(framework);
  configureAppThemeModule(framework);
  configureDialogModule(framework);
  configureDocInfoModule(framework);
  configureOpenInApp(framework);
  configAtMenuConfigModule(framework);
}
