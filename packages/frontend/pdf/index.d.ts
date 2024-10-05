/* auto-generated by NAPI-RS */
/* eslint-disable */
export declare class PdfDocument {
  pages(): PdfPages;
  clone(): PdfDocument;
}

export declare class PdfManager {
  constructor();
  static bindToLibrary(path: string): PdfManager;
  openWithId(id: string): PdfDocument | null;
  open(
    id: string,
    bytes: Buffer,
    password?: string | undefined | null
  ): PdfDocument | null;
  close(id: string): boolean;
}

export declare class PdfPage {
  text(): string;
}

export declare class PdfPages {
  len(): number;
  get(index: number): PdfPage | null;
}
