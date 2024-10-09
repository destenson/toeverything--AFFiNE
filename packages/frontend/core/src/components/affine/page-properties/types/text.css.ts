import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const textarea = style({
  border: 'none',
  height: '100%',
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  whiteSpace: 'break-spaces',
  wordBreak: 'break-word',
  padding: `6px`,
  overflow: 'hidden',
  fontSize: cssVar('fontSm'),
  lineHeight: '22px',
});

export const textPropertyValueContainer = style({
  border: `1px solid transparent`,
  ':focus-within': {
    border: `1px solid ${cssVar('blue700')}`,
    boxShadow: cssVar('activeShadow'),
    backgroundColor: cssVarV2('layer/background/hoverOverlay'),
  },
});

export const textInvisible = style({
  border: 'none',
  whiteSpace: 'break-spaces',
  wordBreak: 'break-word',
  overflow: 'hidden',
  visibility: 'hidden',
  fontSize: cssVar('fontSm'),
  lineHeight: '22px',
});
