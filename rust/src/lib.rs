extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

mod markdown;

#[wasm_bindgen]
extern "C" {
    fn doHighlight(lang: &str, code: &str) -> String;
    fn wasmDoFormatText(text: &str, options: &JsValue) -> String;
}

#[wasm_bindgen]
pub fn domarkdown(text: &str, options: &JsValue) -> String {
    markdown::parse(text, options)
}
