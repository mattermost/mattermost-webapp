// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FileInfo} from '@mattermost/types/files';
import {PostMetadata} from '@mattermost/types/posts';

export type PostDraft = {
    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
    props?: any;
    caretPosition?: number;
    metadata: PostMetadata;
};
