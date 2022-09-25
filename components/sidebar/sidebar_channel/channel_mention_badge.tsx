// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    unreadMentions: number;
    isUnread?: boolean;
};

export default function ChannelMentionBadge({unreadMentions, isUnread}: Props) {
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

    if (isUnread) {
        return (<span id='unreadMentions' className='badge' style={style.undread} />);
    }

    return null;
}

const style = {
    undread: {
        borderRadius: '20px',
        minWidth: '12px',
        minHeight: '12px',
    },
};
