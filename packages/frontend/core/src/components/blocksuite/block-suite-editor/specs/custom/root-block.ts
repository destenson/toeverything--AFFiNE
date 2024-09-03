import {
  AIEdgelessRootBlockSpec,
  AIPageRootBlockSpec,
} from '@affine/core/blocksuite/presets/ai';
import { mixpanel } from '@affine/core/mixpanel';
import { EditorSettingService } from '@affine/core/modules/editor-settting';
import {
  BlockFlavourIdentifier,
  BlockServiceIdentifier,
  ConfigExtension,
  type ExtensionType,
  StdIdentifier,
} from '@blocksuite/block-std';
import type { RootService, TelemetryEventMap } from '@blocksuite/blocks';
import {
  AffineCanvasTextFonts,
  EdgelessRootService,
  PageRootService,
} from '@blocksuite/blocks';
import { type FrameworkProvider } from '@toeverything/infra';

import { createLinkedWidgetConfig } from './widgets/linked';
import { createToolbarMoreMenuConfig } from './widgets/toolbar';

function customLoadFonts(service: RootService): void {
  if (runtimeConfig.isSelfHosted) {
    const fonts = AffineCanvasTextFonts.map(font => ({
      ...font,
      // self-hosted fonts are served from /assets
      url: '/assets/' + new URL(font.url).pathname.split('/').pop(),
    }));
    service.fontLoader.load(fonts);
  } else {
    service.fontLoader.load(AffineCanvasTextFonts);
  }
}

// TODO: make load fonts and telemetry service as BS extension
function withAffineRootService(Service: typeof PageRootService) {
  return class extends Service {
    override loadFonts(): void {
      customLoadFonts(this);
    }

    override telemetryService = {
      track: <T extends keyof TelemetryEventMap>(
        eventName: T,
        props: TelemetryEventMap[T]
      ) => {
        mixpanel.track(eventName as string, props as Record<string, unknown>);
      },
    };
  };
}

export function createPageRootBlockSpec(
  framework: FrameworkProvider
): ExtensionType[] {
  const editorSettingService = framework.get(EditorSettingService);
  return [
    ...AIPageRootBlockSpec,
    {
      setup: di => {
        di.override(
          BlockServiceIdentifier('affine:page'),
          withAffineRootService(PageRootService),
          [StdIdentifier, BlockFlavourIdentifier('affine:page')]
        );
      },
    },
    ConfigExtension('affine:page', {
      linkedWidget: createLinkedWidgetConfig(framework),
      editorSetting: editorSettingService.editorSetting.settingSignal,
      toolbarMoreMenu: createToolbarMoreMenuConfig(framework),
    }),
  ];
}

export function createEdgelessRootBlockSpec(
  framework: FrameworkProvider
): ExtensionType[] {
  const editorSettingService = framework.get(EditorSettingService);
  return [
    ...AIEdgelessRootBlockSpec,
    {
      setup: di => {
        di.override(
          BlockServiceIdentifier('affine:page'),
          withAffineRootService(EdgelessRootService as never),
          [StdIdentifier, BlockFlavourIdentifier('affine:page')]
        );
      },
    },
    ConfigExtension('affine:page', {
      linkedWidget: createLinkedWidgetConfig(framework),
      editorSetting: editorSettingService.editorSetting.settingSignal,
      toolbarMoreMenu: createToolbarMoreMenuConfig(framework),
    }),
  ];
}
