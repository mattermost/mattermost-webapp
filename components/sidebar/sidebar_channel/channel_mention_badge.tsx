// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    unreadMentions: number;
    isUnread?: boolean;
};

type State = {

};

export default class ChannelMentionBadge extends React.PureComponent<Props, State> {
    render() {
        if (this.props.unreadMentions > 0) {
            return (
                <span
                    id='unreadMentions'
                    className='badge'
                >
                    {this.props.unreadMentions}
                </span>
            );
        }

        if (this.props.isUnread) {
            return (<span id='unreadMentions' className='badge' style={style.undread} />);
        }

        return null;
    }
}

const style = {
    undread: {
        borderRadius: '20px',
        padding: '2px',
        minWidth: '12px',
        minHeight: '12px',
        marginTop: '4px',
    },
};
