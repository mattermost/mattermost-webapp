// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    channelId: string;
    unreadMentions: number;
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

        return null;
    }
}
