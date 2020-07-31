// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Options} from 'turndown';

export const channelMentionsRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'A' && (node as HTMLElement).className === 'mention-link' && Boolean((node as HTMLElement).getAttribute('data-channel-mention'));
    },
    replacement: (content: string, node: Node): string => {
        const channelName = (node as HTMLElement).getAttribute('data-channel-mention');
        if (channelName) {
            return `~${channelName}`;
        }
        return '';
    }
};

export const hashtagsRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'A' && (node as HTMLElement).className === 'mention-link' && Boolean((node as HTMLElement).getAttribute('data-hashtag'));
    },
    replacement: (content: string, node: Node): string => {
        return (node as HTMLElement).getAttribute('data-hashtag') || '';
    }
};

// This fix a problem related to coping and pasting markdown images from the existing posts
export const filePreviewButtonRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'file-preview__button';
    },
    replacement: (content: string): string => {
        return content;
    }
};

export const codeBlockRule = {
    filter: (node: Node) => {
        return node.nodeName === 'CODE' && (node as HTMLElement).className.indexOf('hljs') !== -1;
    },

    replacement: (content: string, node: Node, options: Options) => {
        const language = ((node as HTMLElement).className.match(/language-(\S+)/) || [null, ''])[1];
        const code = node.textContent || '';

        const fenceChar = options.fence?.charAt(0) || '`';
        let fenceSize = 3;
        const fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm');

        let match;
        while ((match = fenceInCodeRegex.exec(code))) {
            if (match[0].length >= fenceSize) {
                fenceSize = match[0].length + 1;
            }
        }

        const fence = Array(fenceSize + 1).join(fenceChar);

        return `\n\n${fence}${language}\n${code.replace(/\n$/, '')}\n${fence}\n\n`;
    }
};
