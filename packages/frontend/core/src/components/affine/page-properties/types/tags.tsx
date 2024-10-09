import { PropertyValue } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { DocService, useService } from '@toeverything/infra';

import { TagsInlineEditor } from '../tags-inline-editor';
import * as styles from './tags.css';

export const TagsValue = () => {
  const t = useI18n();

  const doc = useService(DocService).doc;

  return (
    <PropertyValue>
      <TagsInlineEditor
        className={styles.tagInlineEditor}
        placeholder={t[
          'com.affine.page-properties.property-value-placeholder'
        ]()}
        pageId={doc.id}
      />
    </PropertyValue>
  );
};
