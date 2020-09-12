// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
}
