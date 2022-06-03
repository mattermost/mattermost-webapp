// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FileInfo} from '@mattermost/types/files';

export type LinkInfo = {
    has_preview_image: boolean;
    link: string;
    extension: string;
    name: string;
}

export function isFileInfo(info: FileInfo | LinkInfo): info is FileInfo {
    return Boolean((info as FileInfo).id);
}
