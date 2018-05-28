extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

mod markdown;

#[wasm_bindgen]
extern {
    fn doHighlight(lang: &str, code: &str) -> String;
    fn wasmDoFormatText(text: &str, options: &JsValue) -> String;
}

#[wasm_bindgen]
pub fn domarkdown(options: &JsValue) -> String {
    if options.is_undefined() {
        return String::from("it's not defined!2")
    }
    if options.is_null() {
        return String::from("it's null!2")
    }
    String::from("SUCCESS!")
    //markdown::parse(text, options)
}

