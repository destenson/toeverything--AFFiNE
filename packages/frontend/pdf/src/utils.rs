use napi::bindgen_prelude::*;
use napi_derive::napi;
use pdfium_render::prelude::{PdfPageOrientation, PdfPagePaperSize, PdfPageRenderRotation};

#[napi]
pub enum Rotation {
  Zero,
  Quarter,
  Half,
  ThreeQuarters,
}

impl From<Rotation> for PdfPageRenderRotation {
  fn from(value: Rotation) -> Self {
    match value {
      Rotation::Zero => Self::None,
      Rotation::Quarter => Self::Degrees90,
      Rotation::Half => Self::Degrees180,
      Rotation::ThreeQuarters => Self::Degrees270,
    }
  }
}

#[napi]
#[derive(PartialEq)]
pub enum Orientation {
  Portrait,
  Landscape,
  Custom,
}

impl From<PdfPageOrientation> for Orientation {
  fn from(value: PdfPageOrientation) -> Self {
    match value {
      PdfPageOrientation::Portrait => Self::Portrait,
      PdfPageOrientation::Landscape => Self::Portrait,
    }
  }
}

#[napi]
pub struct PageSize(PdfPagePaperSize);

#[napi]
impl PageSize {
  #[napi]
  pub fn layout(&self) -> Orientation {
    match self.0 {
      PdfPagePaperSize::Portrait(_) => Orientation::Portrait,
      PdfPagePaperSize::Landscape(_) => Orientation::Landscape,
      PdfPagePaperSize::Custom(_, _) => Orientation::Custom,
    }
  }
}

impl From<PdfPagePaperSize> for PageSize {
  fn from(value: PdfPagePaperSize) -> Self {
    Self(value)
  }
}

#[napi]
pub struct ImageData {
  pub data: Uint8ClampedArray,
  pub width: i32,
  pub height: i32,
}
