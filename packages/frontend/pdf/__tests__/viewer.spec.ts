import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { nanoid } from '@blocksuite/affine/store';
import { Jimp } from 'jimp';
import { assert, expect, test } from 'vitest';

import { Viewer } from '../index';

test('pdf viewer', async () => {
  const path = fileURLToPath(new URL('..', import.meta.url));
  const viewer = Viewer.bindToLibrary(path);

  const filepath = fileURLToPath(
    new URL('./fixtures/minimal.pdf', import.meta.url)
  );
  const bytes = readFileSync(filepath);

  const id = nanoid();

  const doc = viewer.open(id, bytes);
  assert(doc);

  const pages = doc.pages();
  expect(pages.len()).toBe(1);

  const page = pages.get(0);
  assert(page);
  expect(page.text().length).gt(0);

  const rect = page.rect();
  const width = rect.width();
  const height = rect.height();
  const data = page.render(width, height);
  assert(data);

  const image = await Jimp.read(
    fileURLToPath(new URL('./fixtures/minimal.png', import.meta.url))
  );
  expect(data.buffer.byteLength).toBe(image.bitmap.data.byteLength);

  const doc2 = viewer.openWithId(id);
  assert(doc2);

  const pages2 = doc2.pages();
  expect(pages2.len()).toBe(1);

  const page2 = pages2.get(0);
  assert(page2);
  console.log(page2.text());
});
