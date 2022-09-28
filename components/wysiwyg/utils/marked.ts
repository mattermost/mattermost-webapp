// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import DOMPurify from 'dompurify';
import {marked} from 'markedjs';

/**
 * Initialize Marked with sensible defaults.
 */
marked.use({
    gfm: false,
    headerIds: false,
});

/**
 * Custom renderer and tokenizer for strikethrough.
 */
marked.use({
    renderer: {
        del(text) {
            return `<s>${text}</s>`;
        },
    },
    tokenizer: {
        del(src) {
            const match = (/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/).exec(src);

            if (match) {
                return {
                    type: 'del',
                    raw: match[0],
                    text: match[2],
                    tokens: this.lexer.inlineTokens(match[2], []),
                };
            }

            return false;
        },
    },
});

/**
 * Custom renderer for standard lists and task lists.
 */
marked.use({
    renderer: {
        list(body, ordered, start) {
            if (!ordered && body.includes('data-type="taskItem"')) {
                return `<ul data-type="taskList">\n${body}</ul>`;
            }

            const listTag = ordered ? 'ol' : 'ul';

            return `<${listTag}${
                ordered && start !== 1 ? ` start="${start}"` : ''
            }>\n${body}</${listTag}>\n`;
        },
        listitem(text) {
            const taskItem = (/^\[[ xX]\] (.+)/).exec(text);

            if (taskItem) {
                return `<li data-checked="${taskItem[0] !== '[ ] '}" data-type="taskItem"><p>${
                    taskItem[1]
                }</p></li>`;
            }

            if (text.includes('<ul>') || text.includes('<ol>')) {
                return `<li><p>${text.replace(/^(?:(.+)(<(?:ul|ol)>))/, '$1</p>$2')}</li>`;
            }

            return `<li><p>${text}</p></li>`;
        },
    },
});

function markdownToHtml(markdown: string) {
    return DOMPurify.sanitize(marked(markdown), {
        USE_PROFILES: {
            html: true,
        },
    });
}

export {markdownToHtml};
