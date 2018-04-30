// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked from 'marked';

/** A Markdown renderer that converts a post into plain text that we can search for mentions */
export default class MentionableRenderer extends marked.Renderer {
    code() {
        // Code blocks can't contain mentions
        return '\n';
    }

    blockquote(text) {
        return text + '\n';
    }

    heading(text) {
        return text + '\n';
    }

    hr() {
        return '\n';
    }

    list(body) {
        return body + '\n';
    }

    listitem(text) {
        return text + '\n';
    }

    paragraph(text) {
        return text + '\n';
    }

    table(header, body) {
        return header + '\n' + body;
    }

    tablerow(content) {
        return content;
    }

    tablecell(content) {
        return content + '\n';
    }

    strong(text) {
        return ' ' + text + ' ';
    }

    em(text) {
        return ' ' + text + ' ';
    }

    codespan() {
        // Code spans can't contain mentions
        return ' ';
    }

    br() {
        return '\n';
    }

    del(text) {
        return ' ' + text + ' ';
    }

    link(href, title, text) {
        return ' ' + text + ' ';
    }

    image(href, title, text) {
        return ' ' + text + ' ';
    }

    text(text) {
        return text;
    }
}
