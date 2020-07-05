// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

export const filePreviewButtonRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'DIV' && (node as HTMLElement).className === 'file-preview__button';
    },
    replacement: (content: string): string => {
        return content;
    }
};
