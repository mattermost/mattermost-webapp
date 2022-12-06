// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

type Props = {
    unreadMentions: number;
    hasUrgent?: boolean;
    isUnread?: boolean;
};

export default function ChannelMentionBadge({unreadMentions, hasUrgent, isUnread}: Props) {
    if (unreadMentions > 0) {
        return (
            <span
                id='unreadMentions'
                className={classNames({badge: true, urgent: hasUrgent})}
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
