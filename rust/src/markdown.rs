extern crate pulldown_cmark;

use self::pulldown_cmark::Parser;

use ::wasm_bindgen::prelude::*;

use std::borrow::Cow;
use std::collections::HashMap;
use std::fmt::Write;
use std::str::from_utf8;
use std::iter::Peekable;

use self::pulldown_cmark::{Event, Tag};
use self::pulldown_cmark::Event::{Start, End, Text, Html, InlineHtml, SoftBreak, HardBreak, FootnoteReference};
use self::pulldown_cmark::Alignment;

pub fn parse(markdown: &str, options: &JsValue) -> String {
    let parser = Parser::new_ext(markdown, self::pulldown_cmark::OPTION_ENABLE_TABLES);

    let mut result = String::new();
    push_html(&mut result, parser, options);
    result
}


enum TableState {
    Head,
    Body,
}

struct Ctx<'b, I: Iterator> {
    iter: Peekable<I>,
    buf: &'b mut String,
    table_state: TableState,
    table_alignments: Vec<Alignment>,
    table_cell_index: usize,
    inside_code_bloc: bool,
    code_block_lang: String,
    options: &'b JsValue,
}

impl<'a, 'b, I: Iterator<Item=Event<'a>>> Ctx<'b, I> {
    fn fresh_line(&mut self) {
        if !(self.buf.is_empty() || self.buf.ends_with('\n')) {
            self.buf.push('\n');
        }
    }

    pub fn run(&mut self) {
        let mut numbers = HashMap::new();
        let mut nest = 0;
        let mut text_buf = String::new();
        while let Some(event) = self.iter.next() {
            if nest > 100 {
                self.buf.clear();
                self.buf.push_str("Post too deeply nested.");
                break;
            }
            match event {
                Start(tag) => {
                    nest += 1;
                    self.start_tag(tag, &mut numbers);
                }
                End(tag) => {
                    self.end_tag(tag);
                    nest -= 1;
                }
                Text(ref text) => {
                    text_buf.push_str(text);
                    if let Some(Text(_)) = self.iter.peek() {
                        continue;
                    }
                    if self.inside_code_bloc {
                        match self.code_block_lang.as_ref() {
                            "html" => self.buf.push_str(&::doHighlight("xml", &text_buf)),
                            "tex" | "latex" => {
                                self.buf.push_str("<div data-latex=\"");
                                self.process_text(&text_buf, false);
                                self.buf.push_str("\"></div>");
                            }
                            _ => self.buf.push_str(&::doHighlight(&self.code_block_lang, &text_buf)),
                        }
                    } else {
                        self.process_text(&text_buf, true);
                    }
                    text_buf.clear()
                }
                Html(html) |
                InlineHtml(html) => self.buf.push_str(&html),
                SoftBreak => self.buf.push('\n'),
                HardBreak => self.buf.push('\n'),
                FootnoteReference(name) => {
                    let len = numbers.len() + 1;
                    self.buf.push_str("<sup class=\"footnote-reference\"><a href=\"#");
                    self.process_text(&*name, false);
                    self.buf.push_str("\">");
                    let number = numbers.entry(name).or_insert(len);
                    self.buf.push_str(&*format!("{}", number));
                    self.buf.push_str("</a></sup>");
                },
            }
        }
    }

    fn start_tag(&mut self, tag: Tag<'a>, numbers: &mut HashMap<Cow<'a, str>, usize>) {
        match tag {
            Tag::Paragraph =>  {
                self.fresh_line();
                self.buf.push_str("<p>");
            }
            Tag::Rule => {
                self.fresh_line();
                self.buf.push_str("<hr />\n")
            }
            Tag::Header(level) => {
                self.fresh_line();
                self.buf.push_str("<h");
                self.buf.push((b'0' + level as u8) as char);
                self.buf.push_str(" class=\"markdown__heading\">");
            }
            Tag::Table(alignments) => {
                self.table_alignments = alignments;
                self.buf.push_str("<div class=\"table-responsive\"><table class=\"markdown__table\">");
            }
            Tag::TableHead => {
                self.table_state = TableState::Head;
                self.buf.push_str("<thead>");
            }
            Tag::TableRow => {
                self.table_cell_index = 0;
                self.buf.push_str("<tr>");
            }
            Tag::TableCell => {
                match self.table_state {
                    TableState::Head => self.buf.push_str("<th"),
                    TableState::Body => self.buf.push_str("<td"),
                }
                match self.table_alignments.get(self.table_cell_index) {
                    Some(&Alignment::Left) => self.buf.push_str(" align=\"left\""),
                    Some(&Alignment::Center) => self.buf.push_str(" align=\"center\""),
                    Some(&Alignment::Right) => self.buf.push_str(" align=\"right\""),
                    _ => (),
                }
                self.buf.push_str(">");
            }
            Tag::BlockQuote => {
                self.fresh_line();
                self.buf.push_str("<blockquote>\n");
            }
            Tag::CodeBlock(info) => {
                self.fresh_line();
                self.inside_code_bloc = true;
                let lang = info.split(' ').next().unwrap();
                self.code_block_lang = String::from(lang);
                if lang.is_empty() {
                    self.buf.push_str("<div class=\"post-code post-code--wrap\"><code class=\"hljs\">");
                } else if lang != "tex" && lang != "latex" {
                    self.buf.push_str(&("<div class =\"post-code\"><span class=\"post-code__language\">".to_owned() + lang + "</span><code class=\"language-"));
                    self.process_text(lang, false);
                    self.buf.push_str("\">");
                }
            }
            Tag::List(Some(1)) => {
                self.fresh_line();
                self.buf.push_str("<ol>\n");
            }
            Tag::List(Some(start)) => {
                self.fresh_line();
                let _ = write!(self.buf, "<ol start=\"{}\">\n", start);
            }
            Tag::List(None) => {
                self.fresh_line();
                self.buf.push_str("<ul>\n");
            }
            Tag::Item => {
                self.fresh_line();
                self.buf.push_str("<li>");
            }
            Tag::Emphasis => self.buf.push_str("<em>"),
            Tag::Strong => self.buf.push_str("<strong>"),
            Tag::Code => self.buf.push_str("<span class=\"codespan__pre-wrap\"><code>"),
            Tag::Link(dest, title) => {
                self.buf.push_str("<a href=\"");
                escape_href(self.buf, &dest);
                if !title.is_empty() {
                    self.buf.push_str("\" title=\"");
                    self.process_text(&title, false);
                }
                self.buf.push_str("\">");
            }
            Tag::Image(dest, title) => {
                self.buf.push_str("<img src=\"");
                escape_href(self.buf, &dest);
                self.buf.push_str("\" alt=\"");
                self.raw_text(numbers);
                if !title.is_empty() {
                    self.buf.push_str("\" title=\"");
                    self.process_text(&title, false);
                }
                self.buf.push_str("\" />")
            }
            Tag::FootnoteDefinition(name) => {
                self.fresh_line();
                let len = numbers.len() + 1;
                self.buf.push_str("<div class=\"footnote-definition\" id=\"");
                self.process_text(&*name, false);
                self.buf.push_str("\"><sup class=\"footnote-definition-label\">");
                let number = numbers.entry(name).or_insert(len);
                self.buf.push_str(&*format!("{}", number));
                self.buf.push_str("</sup>");
            }
        }
    }

    fn end_tag(&mut self, tag: Tag) {
        match tag {
            Tag::Paragraph => self.buf.push_str("</p>\n"),
            Tag::Rule => (),
            Tag::Header(level) => {
                self.buf.push_str("</h");
                self.buf.push((b'0' + level as u8) as char);
                self.buf.push_str(">\n");
            }
            Tag::Table(_) => {
                self.buf.push_str("</tbody></table></div>\n");
            }
            Tag::TableHead => {
                self.buf.push_str("</thead><tbody>\n");
                self.table_state = TableState::Body;
            }
            Tag::TableRow => {
                self.buf.push_str("</tr>\n");
            }
            Tag::TableCell => {
                match self.table_state {
                    TableState::Head => self.buf.push_str("</th>"),
                    TableState::Body => self.buf.push_str("</td>"),
                }
                self.table_cell_index += 1;
            }
            Tag::BlockQuote => self.buf.push_str("</blockquote>\n"),
            Tag::CodeBlock(_) => {
                self.inside_code_bloc = false;
                if self.code_block_lang != "tex" && self.code_block_lang != "latex" {
                    self.buf.push_str("</code></div>\n")
                }
            }
            Tag::List(Some(_)) => self.buf.push_str("</ol>\n"),
            Tag::List(None) => self.buf.push_str("</ul>\n"),
            Tag::Item => self.buf.push_str("</li>\n"),
            Tag::Emphasis => self.buf.push_str("</em>"),
            Tag::Strong => self.buf.push_str("</strong>"),
            Tag::Code => self.buf.push_str("</code></span>"),
            Tag::Link(_, _) => self.buf.push_str("</a>"),
            Tag::Image(_, _) => (), // shouldn't happen, handled in start
            Tag::FootnoteDefinition(_) => self.buf.push_str("</div>\n"),
        }
    }

    fn process_text(&mut self, s: &str, do_format: bool) {
        if do_format {
            self.buf.push_str(&::wasmDoFormatText(s, self.options))
        } else {
            escape_html(self.buf, s, false)
        }
    }

    // run raw text, consuming end tag
    fn raw_text<'c>(&mut self, numbers: &'c mut HashMap<Cow<'a, str>, usize>) {
        let mut nest = 0;
        while let Some(event) = self.iter.next() {
            match event {
                Start(_) => nest += 1,
                End(_) => {
                    if nest == 0 { break; }
                    nest -= 1;
                }
                Text(text) => self.process_text(&text, false),
                Html(_) => (),
                InlineHtml(html) => self.process_text(&html, false),
                SoftBreak | HardBreak => self.buf.push(' '),
                FootnoteReference(name) => {
                    let len = numbers.len() + 1;
                    let number = numbers.entry(name).or_insert(len);
                    self.buf.push_str(&*format!("[{}]", number));
                }
            }
        }
    }
}

/// Iterate over an `Iterator` of `Event`s, generate HTML for each `Event`, and
/// push it to a `String`.
///
/// # Examples
///
/// ```
/// use pulldown_cmark::{html, Parser};
///
/// let markdown_str = r#"
/// hello
/// =====
///
/// * alpha
/// * beta
/// "#;
/// let parser = Parser::new(markdown_str);
///
/// let mut html_buf = String::new();
/// html::push_html(&mut html_buf, parser);
///
/// assert_eq!(html_buf, r#"<h1>hello</h1>
/// <ul>
/// <li>alpha</li>
/// <li>beta</li>
/// </ul>
/// "#);
/// ```
pub fn push_html<'a, I: Iterator<Item=Event<'a>>>(buf: &mut String, iter: I, options: &JsValue) {
    let mut ctx = Ctx {
        iter: iter.peekable(),
        buf: buf,
        table_state: TableState::Head,
        table_alignments: vec![],
        table_cell_index: 0,
        inside_code_bloc: false,
        code_block_lang: String::new(),
        options: options,
    };
    ctx.run();
}

static HREF_SAFE: [u8; 128] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
    ];

static HEX_CHARS: &'static [u8] = b"0123456789ABCDEF";

pub fn escape_href(ob: &mut String, s: &str) {
    let mut mark = 0;
    for i in 0..s.len() {
        let c = s.as_bytes()[i];
        if c >= 0x80 || HREF_SAFE[c as usize] == 0 {
            // character needing escape

            // write partial substring up to mark
            if mark < i {
                ob.push_str(&s[mark..i]);
            }
            match c {
                b'&' => {
                    ob.push_str("&amp;");
                },
                b'\'' => {
                    ob.push_str("&#x27;");
                },
                _ => {
                    let mut buf = [0u8; 3];
                    buf[0] = b'%';
                    buf[1] = HEX_CHARS[((c as usize) >> 4) & 0xF];
                    buf[2] = HEX_CHARS[(c as usize) & 0xF];
                    ob.push_str(from_utf8(&buf).unwrap());
                }
            }
            mark = i + 1;  // all escaped characters are ASCII
        }
    }
    ob.push_str(&s[mark..]);
}

static HTML_ESCAPE_TABLE: [u8; 256] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 5, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];

static HTML_ESCAPES: [&'static str; 6] = [
        "",
        "&quot;",
        "&amp;",
        "&#47;",
        "&lt;",
        "&gt;"
    ];

pub fn escape_html(ob: &mut String, s: &str, secure: bool) {
    let size = s.len();
    let bytes = s.as_bytes();
    let mut mark = 0;
    let mut i = 0;
    while i < size {
        match bytes[i..].iter().position(|&c| HTML_ESCAPE_TABLE[c as usize] != 0) {
            Some(pos) => {
                i += pos;
            }
            None => break
        }
        let c = bytes[i];
        let escape = HTML_ESCAPE_TABLE[c as usize];
        if escape != 0 && (secure || c != b'/') {
            ob.push_str(&s[mark..i]);
            ob.push_str(HTML_ESCAPES[escape as usize]);
            mark = i + 1;  // all escaped characters are ASCII
        }
        i += 1;
    }
    ob.push_str(&s[mark..]);
}
