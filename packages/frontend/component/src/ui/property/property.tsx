import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import clsx from 'clsx';
import { forwardRef, type HTMLProps, type ReactNode } from 'react';

import { DropIndicator } from '../dnd';
import { Menu } from '../menu';
import * as styles from './property.css';

export const PropertyRoot = forwardRef<
  HTMLDivElement,
  {
    dropIndicatorEdge?: Edge | null;
  } & HTMLProps<HTMLDivElement>
>(({ children, className, dropIndicatorEdge, ...props }, ref) => {
  return (
    <div ref={ref} className={clsx(styles.propertyRoot, className)} {...props}>
      {children}
      <DropIndicator edge={dropIndicatorEdge} />
    </div>
  );
});
PropertyRoot.displayName = 'PropertyRoot';

export const PropertyName = ({
  icon,
  name,
  className,
  menuItems,
  ...props
}: {
  icon?: ReactNode;
  name?: ReactNode;
  menuItems?: ReactNode;
} & HTMLProps<HTMLDivElement>) => {
  const hasMenu = !!menuItems;
  const content = (
    <div
      className={clsx(styles.propertyNameContainer, className)}
      data-has-menu={hasMenu}
      {...props}
    >
      <div className={styles.propertyNameInnerContainer}>
        {icon && <div className={styles.propertyIconContainer}>{icon}</div>}
        <div className={styles.propertyNameContent}>{name}</div>
      </div>
    </div>
  );

  if (menuItems) {
    return <Menu items={menuItems}>{content}</Menu>;
  }
  return content;
};

export const PropertyValue = ({
  children,
  className,
  readonly,
  ...props
}: { readonly?: boolean } & HTMLProps<HTMLDivElement>) => {
  return (
    <div
      className={clsx(styles.propertyValueContainer, className)}
      data-readonly={readonly ? 'true' : 'false'}
      {...props}
    >
      {children}
    </div>
  );
};
