// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked from 'marked';

export default class RemoveMarkdown extends marked.Renderer {
    code(text) {
        return text.split('\n')[0];
    }

    blockquote(text) {
        return text.split('\n')[0];
    }

    heading(text) {
        return text + '\n';
    }

    hr() {
        return '';
    }

    list(body) {
        return body.split('\n')[0];
    }

    listitem(text) {
        return text + '\n';
    }

    paragraph(text) {
        return text.split('\n')[0];
    }

    table() {
        return '';
    }

    tablerow() {
        return '';
    }

    tablecell() {
        return '';
    }

    strong(text) {
        return text;
    }

    em(text) {
        return text;
    }

    codespan(text) {
        return text;
    }

    br() {
        return ' ';
    }

    del(text) {
        return text;
    }

    link(href, title, text) {
        return text;
    }

    image(href, title, text) {
        return text;
    }

    text(text) {
        return text.split('\n')[0];
    }
}
