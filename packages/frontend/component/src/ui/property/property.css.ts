import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const propertyRoot = style({
  display: 'flex',
  minHeight: 32,
  position: 'relative',
  paddingLeft: '2px',
  selectors: {
    '&[draggable="true"]': {
      cursor: 'grab',
    },
    '&[draggable="true"][data-dragging="true"]': {
      visibility: 'hidden',
    },
    '&[draggable="true"]:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      cursor: 'grab',
      top: '50%',
      left: 0,
      borderRadius: '2px',
      backgroundColor: cssVarV2('text/placeholder'),
      transform: 'translate(-4px, -50%)',
      transition: 'height 0.2s 0.1s, opacity 0.2s 0.1s',
      opacity: 0,
      height: '4px',
      width: '4px',
      willChange: 'height, opacity',
    },
    '&[draggable="true"]:hover:before': {
      height: 12,
      opacity: 1,
    },
  },
});

export const propertyNameContainer = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 4,
  fontSize: cssVar('fontSm'),
  padding: `6px 6px 6px 4px`,
  flexShrink: 0,
  lineHeight: '22px',
  userSelect: 'none',
  color: cssVarV2('text/secondary'),
  width: '160px',
  selectors: {
    '&[data-has-menu="true"]': {
      cursor: 'pointer',
    },
    '&[data-has-menu="true"]:hover': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
  },
});

export const propertyNameInnerContainer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
});

export const propertyIconContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '2px',
  fontSize: 16,
  color: cssVarV2('icon/secondary'),
});

export const propertyNameContent = style({
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: cssVar('fontSm'),
});

export const propertyValueContainer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  position: 'relative',
  borderRadius: 4,
  fontSize: cssVar('fontSm'),
  lineHeight: '22px',
  padding: `6px 6px 6px 8px`,
  flex: 1,
  ':focus-visible': {
    outline: 'none',
  },
  '::placeholder': {
    color: cssVarV2('text/placeholder'),
  },
  selectors: {
    '&[data-readonly="false"]': {
      cursor: 'pointer',
    },
    '&[data-readonly="false"]:hover': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
    '&[data-readonly="false"]:focus-within': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
  },
});
