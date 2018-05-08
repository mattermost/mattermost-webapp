// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked from 'marked';

import Renderer from './renderer';

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
