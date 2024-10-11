use std::env::var;

const DOWNLOAD_BASE_URL: &str = "https://github.com/bblanchon/pdfium-binaries/releases/download";
const TAG: &str = "chromium%2F6721";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  let os = match var("CARGO_CFG_TARGET_OS").as_deref() {
    Ok("windows") => "win",
    Ok("macos") => "mac",
    Ok("ios") => "ios",
    Ok("android") => "android",
    // linux
    _ => "linux",
  };
  let arch = match var("CARGO_CFG_TARGET_ARCH").as_deref() {
    Ok("x86") => "x86",
    Ok("x86_64") => "x64",
    Ok("arm") => "arm",
    Ok("aarch64") => "arm64",
    _ => "x64",
  };

  let mut file = String::new();
  let dir = format!("pdfium-{}-{}", os, arch);
  let mut source_file = std::path::PathBuf::new();
  source_file.push(&dir);

  if os == "win" {
    // TODO: lib/pdfium.dll.lib
    file.push_str("pdfium.dll");

    source_file.push("bin");
  } else {
    file.push_str("libpdfium.");

    if os == "mac" || os == "ios" {
      file.push_str("dylib");
    } else {
      file.push_str("so");
    }

    source_file.push("lib");
  }

  source_file.push(&file);

  println!("cargo::rerun-if-changed={file}");

  let url = format!("{}/{}/{}.tgz", DOWNLOAD_BASE_URL, TAG, dir);

  let resp = reqwest::Client::builder()
    .build()
    .unwrap()
    .get(url)
    .send()
    .await?;
  let body = resp.bytes().await?;

  let tar = flate2::read::GzDecoder::new(&body[..]);
  let mut archive = tar::Archive::new(tar);
  archive.unpack(&dir)?;

  std::fs::rename(source_file, file)?;
  std::fs::remove_dir_all(dir)?;

  napi_build::setup();

  Ok(())
}
