import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

export const numberPropertyValueInput = style({
  border: `1px solid transparent`,
  padding: `6px`,
  width: '100%',
  height: '100%',
  borderRadius: '4px',
  ':focus': {
    border: `1px solid ${cssVar('blue700')}`,
    boxShadow: cssVar('activeShadow'),
  },
  selectors: {
    '&[data-empty="true"]': {
      fontSize: cssVar('fontSm'),
    },
  },
});

export const numberPropertyValueContainer = style({
  padding: '0px',
});
