// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    channelName: string;
}

export default class RhsCommentBroadcast extends PureComponent<Props> {
    render() {
        return (
            <div
                data-testid='post-link'
                className='post__link broadcast-reply'
            >
                <span>
                    <FormattedMessage
                        id='rhs_comment.broadcast.channel'
                        defaultMessage='Also sent to ~{channel}'
                        values={{
                            channel: this.props.channelName,
                        }}
                    />
                </span>
            </div>
        );
    }
}
