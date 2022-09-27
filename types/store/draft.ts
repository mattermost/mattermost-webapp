// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {JSONContent} from '@tiptap/react';

import {FileInfo} from '@mattermost/types/files';

export type PostDraft = {
    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
    props?: any;
    caretPosition?: number;
};

export type NewPostDraft = {
    content: JSONContent;
}
