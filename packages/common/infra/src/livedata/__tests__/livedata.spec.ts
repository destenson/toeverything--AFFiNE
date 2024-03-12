import type { Subscriber } from 'rxjs';
import { combineLatest, Observable, of } from 'rxjs';
import { describe, expect, test, vitest } from 'vitest';
import {
  applyUpdate,
  Array as YArray,
  Doc as YDoc,
  encodeStateAsUpdate,
} from 'yjs';

import { LiveData } from '..';

describe('livedata', () => {
  test('LiveData', async () => {
    const livedata = new LiveData(0);
    expect(livedata.value).toBe(0);
    livedata.next(1);
    expect(livedata.value).toBe(1);
    let subscribed = 0;
    livedata.subscribe(v => {
      subscribed = v;
    });
    livedata.next(2);
    expect(livedata.value).toBe(2);
    await vitest.waitFor(() => subscribed === 2);
  });

  test('from', async () => {
    {
      const livedata = LiveData.from(of(1, 2, 3, 4), 0);
      expect(livedata.value).toBe(4);
    }

    {
      let subscriber: Subscriber<number> = null!;
      const observable = new Observable<number>(s => {
        subscriber = s;
      });
      const livedata = LiveData.from(observable, 0);
      let value = 0;
      livedata.subscribe(v => {
        value = v;
      });

      expect(value).toBe(0);
      subscriber.next(1);
      expect(value).toBe(1);
      subscriber.next(2);
      expect(value).toBe(2);
    }

    {
      let observableSubscribed = false;
      let observableClosed = false;
      const observable = new Observable(subscriber => {
        observableSubscribed = true;
        subscriber.next(1);
        return () => {
          observableClosed = true;
        };
      });
      const livedata = LiveData.from(observable, 0);
      expect(observableSubscribed).toBe(false);
      const subscription = livedata.subscribe(_ => {});
      expect(observableSubscribed).toBe(true);
      expect(observableClosed).toBe(false);
      subscription.unsubscribe();
      expect(observableClosed).toBe(true);
    }

    {
      let subscriber: Subscriber<number> = null!;
      const observable = new Observable<number>(s => {
        subscriber = s;
      });
      const livedata = LiveData.from(observable, 0);
      let value1 = 0;
      livedata.subscribe(v => {
        value1 = v;
      });

      let value2 = 0;
      livedata.subscribe(v => {
        value2 = v;
      });

      expect(value1).toBe(0);
      expect(value2).toBe(0);
      subscriber.next(1);
      expect(value1).toBe(1);
      expect(value2).toBe(1);
      subscriber.next(2);
      expect(value1).toBe(2);
      expect(value2).toBe(2);
    }

    {
      let observableSubscribed = false;
      let observableClosed = false;
      const observable = new Observable(subscriber => {
        observableSubscribed = true;
        subscriber.next(1);
        return () => {
          observableClosed = true;
        };
      });
      const livedata = LiveData.from(observable, 0);
      expect(observableSubscribed).toBe(false);
      const subscription1 = livedata.subscribe(_ => {});
      const subscription2 = livedata.subscribe(_ => {});
      expect(observableSubscribed).toBe(true);
      expect(observableClosed).toBe(false);
      subscription1.unsubscribe();
      expect(observableClosed).toBe(false);
      subscription2.unsubscribe();
      expect(observableClosed).toBe(true);
    }

    {
      let observerCount = 0;
      const observable = new Observable(_ => {
        observerCount++;
      });
      const livedata = LiveData.from(observable, 0);
      livedata.subscribe(_ => {});
      livedata.subscribe(_ => {});
      expect(observerCount).toBe(1);
    }

    {
      let value = 0;
      const observable = new Observable<number>(subscriber => {
        subscriber.next(value);
      });
      const livedata = LiveData.from(observable, 0);
      expect(livedata.value).toBe(0);
      value = 1;
      expect(livedata.value).toBe(1);
    }
  });

  test('fromYjs', () => {
    {
      const ydoc = new YDoc();
      const ymap = ydoc.getMap('test');
      ymap.set('a', 1);

      const livedata = LiveData.fromYjs(ymap, ymap => ymap.toJSON());
      expect(livedata.value).toEqual({ a: 1 });

      ymap.set('b', 2);
      expect(livedata.value).toEqual({ a: 1, b: 2 });

      const remoteYdoc = new YDoc();
      const remoteYmap = remoteYdoc.getMap('test');
      remoteYmap.set('c', 3);
      const update = encodeStateAsUpdate(remoteYdoc);
      applyUpdate(ydoc, update);

      expect(livedata.value).toEqual({ a: 1, b: 2, c: 3 });
    }

    {
      const ydoc = new YDoc();
      const ymap = ydoc.getMap('test');
      ymap.set('a', new YArray());
      const yarray = ymap.get('a') as YArray<number>;
      yarray.push([1]);

      const livedata = LiveData.fromYjs(ymap, ymap => ymap.toJSON(), {
        deep: true,
      });
      let value = 0 as any;
      livedata.subscribe(v => {
        value = v;
      });
      expect(value).toEqual({ a: [1] });

      yarray.push([2]);
      expect(value).toEqual({ a: [1, 2] });
    }
  });

  test('map', () => {
    {
      const livedata = new LiveData(0);
      const mapped = livedata.map(v => v + 1);
      expect(mapped.value).toBe(1);
      livedata.next(1);
      expect(mapped.value).toBe(2);
    }

    {
      const livedata = new LiveData(0);
      const mapped = livedata.map(v => v + 1);
      let value = 0;
      mapped.subscribe(v => {
        value = v;
      });
      expect(value).toBe(1);
      livedata.next(1);
      expect(value).toBe(2);
    }

    {
      let observableSubscribed = false;
      let observableClosed = false;
      const observable = new Observable<number>(subscriber => {
        observableSubscribed = true;
        subscriber.next(1);
        return () => {
          observableClosed = true;
        };
      });

      const livedata = LiveData.from(observable, 0);
      const mapped = livedata.map(v => v + 1);

      expect(observableSubscribed).toBe(false);
      const subscription = mapped.subscribe(_ => {});
      expect(observableSubscribed).toBe(true);
      expect(observableClosed).toBe(false);
      subscription.unsubscribe();
      expect(observableClosed).toBe(true);
    }
  });

  test('interop with rxjs', () => {
    const ob = combineLatest([new LiveData(1)]);
    let value = 0;
    ob.subscribe(v => {
      value = v[0];
    });
    expect(value).toBe(1);
  });

  test('flat', () => {
    {
      const wrapped = new LiveData(new LiveData(0));
      const flatten = wrapped.flat();
      expect(flatten.value).toBe(0);

      wrapped.next(new LiveData(1));
      expect(flatten.value).toBe(1);

      wrapped.next(LiveData.from(of(2, 3), 0));
      expect(flatten.value).toBe(3);
    }

    {
      const wrapped = new LiveData(
        new LiveData([
          new LiveData(new LiveData(1)),
          new LiveData(new LiveData(2)),
        ])
      );
      const flatten = wrapped.flat();
      expect(flatten.value).toStrictEqual([1, 2]);
    }

    {
      const wrapped = new LiveData([new LiveData(0), new LiveData(1)]);
      const flatten = wrapped.flat();

      expect(flatten.value).toEqual([0, 1]);

      const inner = new LiveData(2);
      wrapped.next([inner, new LiveData(3)]);
      expect(flatten.value).toEqual([2, 3]);
      inner.next(4);
      expect(flatten.value).toEqual([4, 3]);
    }
  });
});
