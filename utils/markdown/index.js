// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked from 'marked';

import {convertEntityToCharacter} from 'utils/text_formatting.jsx';
import RemoveMarkdown from 'utils/markdown/remove_markdown';

import Renderer from './renderer';

const removeMarkdown = new RemoveMarkdown();

export function format(text, options = {}) {
    return formatWithRenderer(text, new Renderer(null, options));
}

export function formatWithRenderer(text, renderer) {
    const markdownOptions = {
        renderer,
        sanitize: true,
        gfm: true,
        tables: true,
        mangle: false,
    };

    return marked(text, markdownOptions);
}

export function generateShortMessage(text) {
    if (typeof text === 'string' && text.length > 0) {
        const formattedText = formatWithRenderer(text, removeMarkdown);
        return convertEntityToCharacter(formattedText.split('\n')[0]);
    }

    return text;
}
