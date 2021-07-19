// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Node} from 'commonmark';

import {escapeRegex, wrapNode} from './helpers';

const cjkPattern = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\uac00-\ud7a3]/;

interface MentionKey {
    caseSensitive: boolean;
    key: string;
}

export function highlightMentions(ast: Node, mentionKeys: MentionKey[]): Node {
    const walker = ast.walker();

    let e;
    while ((e = walker.next())) {
        if (!e.entering) {
            continue;
        }

        const node = e.node;

        if (node.type === 'text') {
            const {index, mention} = getFirstMention(node.literal || '', mentionKeys);

            if (index === -1 || !mention) {
                continue;
            }

            const mentionNode = highlightTextNode(node, index, index + mention.key.length, 'mention_highlight');

            // Resume processing on the next node after the mention node which may include any remaining text
            // that was part of this one
            walker.resumeAt(mentionNode, false);
        } else if (node.type === 'custom_inline' && node.onEnter.startsWith('at-mention:')) {
            const mentionName = '@' + node.onEnter.substring('at-mention:'.length);

            const matches = mentionKeys.some((mention) => {
                const flags = mention.caseSensitive ? '' : 'i';
                const pattern = new RegExp(`${escapeRegex(mention.key)}\\.?`, flags);

                return pattern.test(mentionName);
            });

            if (!matches) {
                continue;
            }

            const wrapper = new Node('custom_inline');
            wrapNode(wrapper, node);

            // Skip processing the wrapper to prevent checking this node again as its child
            walker.resumeAt(wrapper, false);
        }
    }

    return ast;
}

// Given a string and an array of mention keys, returns the first mention that appears and its index.
export function getFirstMention(str: string, mentionKeys: MentionKey[]): {index: number; mention?: MentionKey} {
    let firstMention;
    let firstMentionIndex = -1;

    for (const mention of mentionKeys) {
        if (mention.key.trim() === '') {
            continue;
        }

        const flags = mention.caseSensitive ? '' : 'i';
        let pattern;
        if (cjkPattern.test(mention.key)) {
            pattern = new RegExp(`${escapeRegex(mention.key)}`, flags);
        } else {
            pattern = new RegExp(`\\b${escapeRegex(mention.key)}_*\\b`, flags);
        }

        const match = pattern.exec(str);
        if (!match || match[0] === '') {
            continue;
        }

        if (firstMentionIndex === -1 || match.index < firstMentionIndex) {
            firstMentionIndex = match.index;
            firstMention = mention;
        }
    }

    return {
        index: firstMentionIndex,
        mention: firstMention,
    };
}

// Given a text node, start/end indices, and a highlight node type, splits it into up to three nodes: the text before
// the highlight (if any exists), the highlighted text, and the text after the highlight the end of the highlight
// (if any exists). Returns a node containing the highlighted text.
export function highlightTextNode(node: Node, start: number, end: number, type: string): Node {
    const literal = node.literal || '';
    node.literal = literal.substring(start, end);

    // Start by wrapping the node and then re-insert any non-highlighted code around it
    const highlighted = new Node('custom_inline');
    wrapNode(highlighted, node);

    // onEnter is a misc field used for adding data to custom nodes, so put the type of highlight in it.
    highlighted.onEnter = type;

    if (start !== 0) {
        const before = new Node('text');
        before.literal = literal.substring(0, start);

        highlighted.insertBefore(before);
    }

    if (end !== literal.length) {
        const after = new Node('text');
        after.literal = literal.substring(end);

        highlighted.insertAfter(after);
    }

    return highlighted;
}
