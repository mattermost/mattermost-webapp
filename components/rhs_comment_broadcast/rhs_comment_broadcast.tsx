// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ArrowRightBoldOutlineIcon} from '@mattermost/compass-icons/components';

type Props = {
    channelName: string;
}

export default function RhsCommentBroadcast(props: Props) {
    const {channelName} = props;

    const arrowRightIcon = (
        <ArrowRightBoldOutlineIcon
            size={18}
            color={'rgba(var(--center-channel-text-rgb), 0.48)'}
            data-testid='arrow-right-icon'
        />
    );

    const channelDisplay = '~' + channelName;

    return (
        <div
            data-testid='post-link'
            className='post__link broadcast--reply'
        >
            <div className='broadcast-arrow-icon'>
                {arrowRightIcon}
                <b>
                    <FormattedMessage
                        id='rhs_comment.broadcast.channel'
                        defaultMessage='Also sent to ~{channel}'
                        values={{
                            channel: channelDisplay,
                        }}
                    />
                </b>
            </div>
        </div>
    );
}
