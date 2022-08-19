// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    unreadMentions: number;
};

export default function ChannelMentionBadge({unreadMentions}: Props) {
    if (unreadMentions > 0) {
        return (
            <span
                id='unreadMentions'
                className='badge'
            >
                {unreadMentions}
            </span>
        );
    }

    return null;
}
