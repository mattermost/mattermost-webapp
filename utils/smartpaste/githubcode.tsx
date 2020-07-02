// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const githubCodeTurndownRule = {
    filter: (node: Node): boolean => {
        return node.nodeName === 'TABLE' && (/\b(js|blob|diff)-./).test((node as HTMLTableElement).className);
    },
    replacement: (content: string): string => {
        if (content) {
            return '```\n' + content + '\n```';
        }
        return '';
    }
};
