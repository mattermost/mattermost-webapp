// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

type Props = {
    channelId: string;
    channelDisplayName: string;
}

export default function BroadcastThreadReply(props: Props) {
    const {channelDisplayName} = props;

    return (
        <div className='checkbox text-left mb-0'>
            <label>
                <input
                    type='checkbox'
                />
                <FormattedMessage
                    id='rhs_thread.broadcast.channel'
                    defaultMessage='Also send to {channel}'
                    values={{
                        channel: <b>{'~'}{channelDisplayName}</b>,
                    }}
                />
            </label>
        </div>
    );
}
