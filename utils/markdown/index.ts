// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked from 'marked';

import {convertEntityToCharacter} from 'utils/text_formatting';

import RemoveMarkdown from 'utils/markdown/remove_markdown';

import Renderer from './renderer';

const removeMarkdown = new RemoveMarkdown();

export function format(text: string, options = {}) {
    return formatWithRenderer(text, new Renderer({}, options));
}

export function formatWithRenderer(text: string, renderer: marked.Renderer) {
    const markdownOptions = {
        renderer,
        sanitize: true,
        gfm: true,
        tables: true,
        mangle: false,
    };

    return marked(text, markdownOptions).trim();
}

export function stripMarkdown(text: string) {
    if (typeof text === 'string' && text.length > 0) {
        return convertEntityToCharacter(
            formatWithRenderer(text, removeMarkdown)
        ).trim();
    }

    return text;
}
