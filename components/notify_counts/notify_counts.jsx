// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class NotifyCounts extends React.PureComponent {
    static propTypes = {
        mentionCount: PropTypes.number.isRequired,
        messageCount: PropTypes.number.isRequired,
    }
    render() {
        if (this.props.mentionCount) {
            return <span className='badge badge-notify'>{this.props.mentionCount}</span>;
        } else if (this.props.messageCount) {
            return <span className='badge badge-notify'>{'•'}</span>;
        }
        return null;
    }
}
