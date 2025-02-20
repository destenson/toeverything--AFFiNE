import { EdgelessCRUDIdentifier } from '@blocksuite/affine-block-surface';
import type {
  EdgelessColorPickerButton,
  PickColorEvent,
} from '@blocksuite/affine-components/color-picker';
import {
  packColor,
  packColorsWithColorScheme,
} from '@blocksuite/affine-components/color-picker';
import {
  AddTextIcon,
  ConnectorCWithArrowIcon,
  ConnectorEndpointNoneIcon,
  ConnectorLWithArrowIcon,
  ConnectorXWithArrowIcon,
  FlipDirectionIcon,
  FrontEndpointArrowIcon,
  FrontEndpointCircleIcon,
  FrontEndpointDiamondIcon,
  FrontEndpointTriangleIcon,
  GeneralStyleIcon,
  RearEndpointArrowIcon,
  RearEndpointCircleIcon,
  RearEndpointDiamondIcon,
  RearEndpointTriangleIcon,
  ScribbledStyleIcon,
  SmallArrowDownIcon,
} from '@blocksuite/affine-components/icons';
import { renderToolbarSeparator } from '@blocksuite/affine-components/toolbar';
import {
  type ColorScheme,
  type ConnectorElementModel,
  type ConnectorElementProps,
  ConnectorEndpoint,
  type ConnectorLabelProps,
  ConnectorMode,
  DEFAULT_FRONT_END_POINT_STYLE,
  DEFAULT_REAR_END_POINT_STYLE,
  DefaultTheme,
  LineWidth,
  PointStyle,
  resolveColor,
  StrokeStyle,
} from '@blocksuite/affine-model';
import type { ColorEvent } from '@blocksuite/affine-shared/utils';
import { countBy, maxBy, WithDisposable } from '@blocksuite/global/utils';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { join } from 'lit/directives/join.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

import {
  type LineStyleEvent,
  LineStylesPanel,
} from '../../edgeless/components/panel/line-styles-panel.js';
import type { EdgelessRootBlockComponent } from '../../edgeless/edgeless-root-block.js';
import { mountConnectorLabelEditor } from '../../edgeless/utils/text.js';

function getMostCommonColor(
  elements: ConnectorElementModel[],
  colorScheme: ColorScheme
): string {
  const colors = countBy(elements, (ele: ConnectorElementModel) =>
    resolveColor(ele.stroke, colorScheme)
  );
  const max = maxBy(Object.entries(colors), ([_k, count]) => count);
  return max
    ? (max[0] as string)
    : resolveColor(DefaultTheme.connectorColor, colorScheme);
}

function getMostCommonMode(
  elements: ConnectorElementModel[]
): ConnectorMode | null {
  const modes = countBy(elements, ele => ele.mode);
  const max = maxBy(Object.entries(modes), ([_k, count]) => count);
  return max ? (Number(max[0]) as ConnectorMode) : null;
}

function getMostCommonLineWidth(elements: ConnectorElementModel[]): LineWidth {
  const sizes = countBy(elements, ele => ele.strokeWidth);
  const max = maxBy(Object.entries(sizes), ([_k, count]) => count);
  return max ? (Number(max[0]) as LineWidth) : LineWidth.Four;
}

export function getMostCommonLineStyle(
  elements: ConnectorElementModel[]
): StrokeStyle {
  const sizes = countBy(elements, ele => ele.strokeStyle);
  const max = maxBy(Object.entries(sizes), ([_k, count]) => count);
  return max ? (max[0] as StrokeStyle) : StrokeStyle.Solid;
}

function getMostCommonRough(elements: ConnectorElementModel[]): boolean {
  const { trueCount, falseCount } = elements.reduce(
    (counts, ele) => {
      if (ele.rough) {
        counts.trueCount++;
      } else {
        counts.falseCount++;
      }
      return counts;
    },
    { trueCount: 0, falseCount: 0 }
  );

  return trueCount > falseCount;
}

function getMostCommonEndpointStyle(
  elements: ConnectorElementModel[],
  endpoint: ConnectorEndpoint,
  fallback: PointStyle
): PointStyle {
  const field =
    endpoint === ConnectorEndpoint.Front
      ? 'frontEndpointStyle'
      : 'rearEndpointStyle';
  const modes = countBy(elements, ele => ele[field]);
  const max = maxBy(Object.entries(modes), ([_k, count]) => count);
  return max ? (max[0] as PointStyle) : fallback;
}

function notEqual<
  K extends keyof Omit<ConnectorElementProps, keyof ConnectorLabelProps>,
>(key: K, value: ConnectorElementProps[K]) {
  return (element: ConnectorElementModel) => element[key] !== value;
}

interface EndpointStyle {
  value: PointStyle;
  icon: TemplateResult<1>;
}

const STYLE_LIST = [
  {
    name: 'General',
    value: false,
    icon: GeneralStyleIcon,
  },
  {
    name: 'Scribbled',
    value: true,
    icon: ScribbledStyleIcon,
  },
] as const;

const STYLE_CHOOSE: [boolean, () => TemplateResult<1>][] = [
  [false, () => GeneralStyleIcon],
  [true, () => ScribbledStyleIcon],
] as const;

const FRONT_ENDPOINT_STYLE_LIST: EndpointStyle[] = [
  {
    value: PointStyle.None,
    icon: ConnectorEndpointNoneIcon,
  },
  {
    value: PointStyle.Arrow,
    icon: FrontEndpointArrowIcon,
  },
  {
    value: PointStyle.Triangle,
    icon: FrontEndpointTriangleIcon,
  },
  {
    value: PointStyle.Circle,
    icon: FrontEndpointCircleIcon,
  },
  {
    value: PointStyle.Diamond,
    icon: FrontEndpointDiamondIcon,
  },
] as const;

const REAR_ENDPOINT_STYLE_LIST: EndpointStyle[] = [
  {
    value: PointStyle.Diamond,
    icon: RearEndpointDiamondIcon,
  },
  {
    value: PointStyle.Circle,
    icon: RearEndpointCircleIcon,
  },
  {
    value: PointStyle.Triangle,
    icon: RearEndpointTriangleIcon,
  },
  {
    value: PointStyle.Arrow,
    icon: RearEndpointArrowIcon,
  },
  {
    value: PointStyle.None,
    icon: ConnectorEndpointNoneIcon,
  },
] as const;

const MODE_LIST = [
  {
    name: 'Curve',
    icon: ConnectorCWithArrowIcon,
    value: ConnectorMode.Curve,
  },
  {
    name: 'Elbowed',
    icon: ConnectorXWithArrowIcon,
    value: ConnectorMode.Orthogonal,
  },
  {
    name: 'Straight',
    icon: ConnectorLWithArrowIcon,
    value: ConnectorMode.Straight,
  },
] as const;

const MODE_CHOOSE: [ConnectorMode, () => TemplateResult<1>][] = [
  [ConnectorMode.Curve, () => ConnectorCWithArrowIcon],
  [ConnectorMode.Orthogonal, () => ConnectorXWithArrowIcon],
  [ConnectorMode.Straight, () => ConnectorLWithArrowIcon],
] as const;

export class EdgelessChangeConnectorButton extends WithDisposable(LitElement) {
  get crud() {
    return this.edgeless.std.get(EdgelessCRUDIdentifier);
  }

  private readonly _setConnectorColor = (e: ColorEvent) => {
    const stroke = e.detail.value;
    this._setConnectorProp('stroke', stroke);
  };

  private readonly _setConnectorStroke = ({ type, value }: LineStyleEvent) => {
    if (type === 'size') {
      this._setConnectorStrokeWidth(value);
      return;
    }
    this._setConnectorStrokeStyle(value);
  };

  pickColor = (e: PickColorEvent) => {
    const field = 'stroke';

    if (e.type === 'pick') {
      const color = e.detail.value;
      this.elements.forEach(ele => {
        const props = packColor(field, color);
        this.crud.updateElement(ele.id, props);
      });
      return;
    }

    this.elements.forEach(ele =>
      ele[e.type === 'start' ? 'stash' : 'pop'](field)
    );
  };

  get doc() {
    return this.edgeless.doc;
  }

  get service() {
    return this.edgeless.service;
  }

  private _addLabel() {
    mountConnectorLabelEditor(this.elements[0], this.edgeless);
  }

  private _flipEndpointStyle(
    frontEndpointStyle: PointStyle,
    rearEndpointStyle: PointStyle
  ) {
    if (frontEndpointStyle === rearEndpointStyle) return;

    this.elements.forEach(element =>
      this.crud.updateElement(element.id, {
        frontEndpointStyle: rearEndpointStyle,
        rearEndpointStyle: frontEndpointStyle,
      })
    );
  }

  private _getEndpointIcon(list: EndpointStyle[], style: PointStyle) {
    return (
      list.find(({ value }) => value === style)?.icon ||
      ConnectorEndpointNoneIcon
    );
  }

  private _setConnectorMode(mode: ConnectorMode) {
    this._setConnectorProp('mode', mode);
  }

  private _setConnectorPointStyle(end: ConnectorEndpoint, style: PointStyle) {
    const props = {
      [end === ConnectorEndpoint.Front
        ? 'frontEndpointStyle'
        : 'rearEndpointStyle']: style,
    };
    this.elements.forEach(element =>
      this.crud.updateElement(element.id, { ...props })
    );
  }

  private _setConnectorProp<
    K extends keyof Omit<ConnectorElementProps, keyof ConnectorLabelProps>,
  >(key: K, value: ConnectorElementProps[K]) {
    this.doc.captureSync();
    this.elements
      .filter(notEqual(key, value))
      .forEach(element =>
        this.crud.updateElement(element.id, { [key]: value })
      );
  }

  private _setConnectorRough(rough: boolean) {
    this._setConnectorProp('rough', rough);
  }

  private _setConnectorStrokeStyle(strokeStyle: StrokeStyle) {
    this._setConnectorProp('strokeStyle', strokeStyle);
  }

  private _setConnectorStrokeWidth(strokeWidth: number) {
    this._setConnectorProp('strokeWidth', strokeWidth);
  }

  private _showAddButtonOrTextMenu() {
    if (this.elements.length === 1 && !this.elements[0].text) {
      return 'button';
    }
    if (!this.elements.some(e => !e.text)) {
      return 'menu';
    }
    return 'nothing';
  }

  override render() {
    const colorScheme = this.edgeless.surface.renderer.getColorScheme();
    const elements = this.elements;
    const selectedColor = getMostCommonColor(elements, colorScheme);
    const selectedMode = getMostCommonMode(elements);
    const selectedLineSize = getMostCommonLineWidth(elements);
    const selectedRough = getMostCommonRough(elements);
    const selectedLineStyle = getMostCommonLineStyle(elements);
    const selectedStartPointStyle = getMostCommonEndpointStyle(
      elements,
      ConnectorEndpoint.Front,
      DEFAULT_FRONT_END_POINT_STYLE
    );
    const selectedEndPointStyle = getMostCommonEndpointStyle(
      elements,
      ConnectorEndpoint.Rear,
      DEFAULT_REAR_END_POINT_STYLE
    );

    return join(
      [
        when(
          this.edgeless.doc.awarenessStore.getFlag('enable_color_picker'),
          () => {
            const { type, colors } = packColorsWithColorScheme(
              colorScheme,
              selectedColor,
              elements[0].stroke
            );

            return html`
              <edgeless-color-picker-button
                class="stroke-color"
                .label=${'Stroke style'}
                .pick=${this.pickColor}
                .color=${selectedColor}
                .colors=${colors}
                .colorType=${type}
                .theme=${colorScheme}
                .palettes=${DefaultTheme.Palettes}
                .hollowCircle=${true}
              >
                <div
                  slot="other"
                  class="line-styles"
                  style=${styleMap({
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                    alignItems: 'center',
                  })}
                >
                  ${LineStylesPanel({
                    selectedLineSize: selectedLineSize,
                    selectedLineStyle: selectedLineStyle,
                    onClick: this._setConnectorStroke,
                  })}
                </div>
                <editor-toolbar-separator
                  slot="separator"
                  data-orientation="horizontal"
                ></editor-toolbar-separator>
              </edgeless-color-picker-button>
            `;
          },
          () => html`
            <editor-menu-button
              .contentPadding=${'8px'}
              .button=${html`
                <editor-icon-button
                  aria-label="Stroke style"
                  .tooltip=${'Stroke style'}
                >
                  <edgeless-color-button
                    .color=${selectedColor}
                  ></edgeless-color-button>
                </editor-icon-button>
              `}
            >
              <stroke-style-panel
                .theme=${colorScheme}
                .strokeWidth=${selectedLineSize}
                .strokeStyle=${selectedLineStyle}
                .strokeColor=${selectedColor}
                .setStrokeStyle=${this._setConnectorStroke}
                .setStrokeColor=${this._setConnectorColor}
              >
              </stroke-style-panel>
            </editor-menu-button>
          `
        ),

        html`
          <editor-menu-button
            .button=${html`
              <editor-icon-button aria-label="Style" .tooltip=${'Style'}>
                ${choose(selectedRough, STYLE_CHOOSE)}${SmallArrowDownIcon}
              </editor-icon-button>
            `}
          >
            <div>
              ${repeat(
                STYLE_LIST,
                item => item.name,
                ({ name, value, icon }) => html`
                  <editor-icon-button
                    aria-label=${name}
                    .tooltip=${name}
                    .active=${selectedRough === value}
                    .activeMode=${'background'}
                    @click=${() => this._setConnectorRough(value)}
                  >
                    ${icon}
                  </editor-icon-button>
                `
              )}
            </div>
          </editor-menu-button>
        `,

        html`
          <editor-menu-button
            .button=${html`
              <editor-icon-button
                aria-label="Start point style"
                .tooltip=${'Start point style'}
              >
                ${this._getEndpointIcon(
                  FRONT_ENDPOINT_STYLE_LIST,
                  selectedStartPointStyle
                )}${SmallArrowDownIcon}
              </editor-icon-button>
            `}
          >
            <div>
              ${repeat(
                FRONT_ENDPOINT_STYLE_LIST,
                item => item.value,
                ({ value, icon }) => html`
                  <editor-icon-button
                    aria-label=${value}
                    .tooltip=${value}
                    .active=${selectedStartPointStyle === value}
                    .activeMode=${'background'}
                    @click=${() =>
                      this._setConnectorPointStyle(
                        ConnectorEndpoint.Front,
                        value
                      )}
                  >
                    ${icon}
                  </editor-icon-button>
                `
              )}
            </div>
          </editor-menu-button>

          <editor-icon-button
            aria-label="Flip direction"
            .tooltip=${'Flip direction'}
            .disabled=${false}
            @click=${() =>
              this._flipEndpointStyle(
                selectedStartPointStyle,
                selectedEndPointStyle
              )}
          >
            ${FlipDirectionIcon}
          </editor-icon-button>

          <editor-menu-button
            .button=${html`
              <editor-icon-button
                aria-label="End point style"
                .tooltip=${'End point style'}
              >
                ${this._getEndpointIcon(
                  REAR_ENDPOINT_STYLE_LIST,
                  selectedEndPointStyle
                )}${SmallArrowDownIcon}
              </editor-icon-button>
            `}
          >
            <div>
              ${repeat(
                REAR_ENDPOINT_STYLE_LIST,
                item => item.value,
                ({ value, icon }) => html`
                  <editor-icon-button
                    aria-label=${value}
                    .tooltip=${value}
                    .active=${selectedEndPointStyle === value}
                    .activeMode=${'background'}
                    @click=${() =>
                      this._setConnectorPointStyle(
                        ConnectorEndpoint.Rear,
                        value
                      )}
                  >
                    ${icon}
                  </editor-icon-button>
                `
              )}
            </div>
          </editor-menu-button>

          <editor-menu-button
            .button=${html`
              <editor-icon-button
                aria-label="Shape"
                .tooltip=${'Connector shape'}
              >
                ${choose(selectedMode, MODE_CHOOSE)}${SmallArrowDownIcon}
              </editor-icon-button>
            `}
          >
            <div>
              ${repeat(
                MODE_LIST,
                item => item.name,
                ({ name, value, icon }) => html`
                  <editor-icon-button
                    aria-label=${name}
                    .tooltip=${name}
                    .active=${selectedMode === value}
                    .activeMode=${'background'}
                    @click=${() => this._setConnectorMode(value)}
                  >
                    ${icon}
                  </editor-icon-button>
                `
              )}
            </div>
          </editor-menu-button>
        `,

        choose<string, TemplateResult<1> | typeof nothing>(
          this._showAddButtonOrTextMenu(),
          [
            [
              'button',
              () => html`
                <editor-icon-button
                  aria-label="Add text"
                  .tooltip=${'Add text'}
                  @click=${this._addLabel}
                >
                  ${AddTextIcon}
                </editor-icon-button>
              `,
            ],
            [
              'menu',
              () => html`
                <edgeless-change-text-menu
                  .elementType=${'connector'}
                  .elements=${this.elements}
                  .edgeless=${this.edgeless}
                ></edgeless-change-text-menu>
              `,
            ],
            ['nothing', () => nothing],
          ]
        ),
      ].filter(button => button !== nothing),
      renderToolbarSeparator
    );
  }

  @property({ attribute: false })
  accessor edgeless!: EdgelessRootBlockComponent;

  @property({ attribute: false })
  accessor elements: ConnectorElementModel[] = [];

  @query('edgeless-color-picker-button.stroke-color')
  accessor strokeColorButton!: EdgelessColorPickerButton;
}

export function renderConnectorButton(
  edgeless: EdgelessRootBlockComponent,
  elements?: ConnectorElementModel[]
) {
  if (!elements?.length) return nothing;

  return html`
    <edgeless-change-connector-button
      .elements=${elements}
      .edgeless=${edgeless}
    >
    </edgeless-change-connector-button>
  `;
}
