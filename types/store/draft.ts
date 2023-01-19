// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {JSONContent} from '@tiptap/react';

import {FileInfo} from '@mattermost/types/files';
import {PostPriorityMetadata} from '@mattermost/types/posts';

export type DraftInfo = {
    id: string;
    type: 'channel' | 'thread';
}

export type PostDraft = {
    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
    props?: any;
    caretPosition?: number;
    channelId: string;
    rootId: string;
    createAt: number;
    updateAt: number;
    show?: boolean;
    remote?: boolean;
    metadata?: {
        priority?: PostPriorityMetadata;
    };
};

export type NewPostDraft = PostDraft & {
    content?: JSONContent;
}
