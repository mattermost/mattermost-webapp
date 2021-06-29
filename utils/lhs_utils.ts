// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from 'mattermost-redux/types/channels';
import {$ID} from 'mattermost-redux/types/utilities';

export enum NonChannelLHSItem {
    GLOBAL_THREADS = 'global_threads',
}

export type LHSItem = NonChannelLHSItem | $ID<Channel>;

export function isNonChannelLHSItem(item: string) {
    const options: string[] = Object.values(NonChannelLHSItem);
    return options.includes(item);
}
