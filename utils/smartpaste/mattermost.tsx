// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import TurndownService, {Options} from 'turndown';

const channelMentionsRule = {
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

const hashtagsRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'A' && (node as HTMLElement).className === 'mention-link' && Boolean((node as HTMLElement).getAttribute('data-hashtag'));
    },
    replacement: (content: string, node: Node): string => {
        return (node as HTMLElement).getAttribute('data-hashtag') || '';
    }
};

// This fix a problem related to coping and pasting markdown images from the existing posts
const filePreviewButtonRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'file-preview__button';
    },
    replacement: (content: string): string => {
        return content;
    }
};

const codeBlockRule = {
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

// Not copy avatars from conversations
const skipAvatarsRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'post__img';
    },
    replacement: (): string => {
        return '';
    }
};

// Not copy reply count
const skipReplyCountRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'SPAN' && (node as HTMLElement).className === 'post-menu__comment-count';
    },
    replacement: (): string => {
        return '';
    }
};

// Not copy reaction count
const skipReactionCountRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'SPAN' && (node as HTMLElement).className === 'Reaction__count';
    },
    replacement: (): string => {
        return '';
    }
};

// Not copy edited indicator
const skipEditedIndicatorRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'SPAN' && (node as HTMLElement).className === 'post-edited__indicator';
    },
    replacement: (): string => {
        return '';
    }
};

// Not copy root post link
const skipRootPostLinkRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'post__link';
    },
    replacement: (): string => {
        return '';
    }
};

// Not copy new messages badge
const skipNewMessagesRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'Separator NotificationSeparator';
    },
    replacement: (): string => {
        return '';
    }
};

// Not date separator
const skipDateSeparatorRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'Separator BasicSeparator';
    },
    replacement: (): string => {
        return '';
    }
};

export default function mattermostPlugin(turndownService: TurndownService) {
    turndownService.addRule('channel-mentions', channelMentionsRule);
    turndownService.addRule('hashtags', hashtagsRule);
    turndownService.addRule('file-preview-button', filePreviewButtonRule);
    turndownService.addRule('mattermost-code-block', codeBlockRule);
    turndownService.addRule('skip-avatars', skipAvatarsRule);
    turndownService.addRule('skip-reply-count', skipReplyCountRule);
    turndownService.addRule('skip-reaction-count', skipReactionCountRule);
    turndownService.addRule('skip-edited-indicator', skipEditedIndicatorRule);
    turndownService.addRule('skip-root-post', skipRootPostLinkRule);
    turndownService.addRule('skip-new-messages-badge', skipNewMessagesRule);
    turndownService.addRule('skip-date-separator', skipDateSeparatorRule);
}
