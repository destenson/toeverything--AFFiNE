import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const propertyRowNamePopupRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  color: cssVarV2('text/secondary'),
  padding: '8px 16px',
  minWidth: 260,
});

export const propertyRowTypeItem = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  fontSize: cssVar('fontSm'),
  padding: '8px 16px',
  minWidth: 260,
});

export const propertyTypeName = style({
  color: cssVarV2('text/secondary'),
  fontSize: cssVar('fontSm'),
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});
