/* auto-generated by NAPI-RS */
/* eslint-disable */
export declare class Document {
  version(): string;
  metadata(): Record<string, string>;
  permissions(): void;
  signatures(): void;
  pages(): Pages;
}

export declare class ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export declare class Page {
  text(): string;
  rect(): Rect;
  paperSize(): PagerSize;
  layout(): Orientation;
  /** Returns `true` if this [`Page`] has orientation [`Orientation::Portrait`]. */
  isPortrait(): boolean;
  /** Returns `true` if this [`Page`] has orientation [`Orientation::Landscape`]. */
  isLandscape(): boolean;
  renderAsBytes(
    width: number,
    height: number,
    rotation?: Rotation | undefined | null
  ): Uint8Array | null;
  render(
    width: number,
    height: number,
    rotation?: Rotation | undefined | null
  ): Uint8ClampedArray | null;
  renderWithScale(scale: number): ImageData | null;
}

export declare class PagerSize {
  layout(): Orientation;
}

export declare class Pages {
  len(): number;
  get(index: number): Page | null;
}

export declare class Rect {
  top(): number;
  right(): number;
  bottom(): number;
  left(): number;
  width(): number;
  height(): number;
}

export declare class Viewer {
  constructor();
  static bindToLibrary(path: string): Viewer;
  openWithId(id: string): Document | null;
  open(
    id: string,
    bytes: Buffer,
    password?: string | undefined | null
  ): Document | null;
  close(id: string): boolean;
}

export declare const enum Orientation {
  Portrait = 0,
  Landscape = 1,
  Custom = 2,
}

export declare const enum Rotation {
  Zero = 0,
  Quarter = 1,
  Half = 2,
  ThreeQuarters = 3,
}
