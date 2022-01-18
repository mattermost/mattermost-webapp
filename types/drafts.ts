// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FileInfo} from 'mattermost-redux/types/files';

export type PostDraft = {
    channelId: string;
    rootId?: string;

    createAt: number;
    updateAt: number;

    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
}
