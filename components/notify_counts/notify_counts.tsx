// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    mentionCount: number;
    messageCount: number;
}

export default class NotifyCounts extends React.PureComponent<Props> {
    render() {
        if (this.props.mentionCount) {
            return <span className='badge badge-notify'>{this.props.mentionCount}</span>;
        } else if (this.props.messageCount) {
            return <span className='badge badge-notify'>{'•'}</span>;
        }
        return null;
    }
}
