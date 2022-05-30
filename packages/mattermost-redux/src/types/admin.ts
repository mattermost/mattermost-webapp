// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ConsoleAccess = {
    read: Record<string, boolean>;
    write: Record<string, boolean>;
}
