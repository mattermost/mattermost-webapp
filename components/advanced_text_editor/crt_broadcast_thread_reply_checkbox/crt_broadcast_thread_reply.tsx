// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';

type Props = {
    channelName: string;
    isBroadcastThreadReply: boolean;
    handleBroadcastThreadReply: () => void;
}

export default function CRTBroadcastThreadReplyCheckbox(props: Props) {
    const {channelName, isBroadcastThreadReply, handleBroadcastThreadReply} = props;

    const tooltip = (
        <Tooltip id='broadcast-thread-reply'>
            <FormattedMessage
                id='rhs_thread.broadcast.tooltip'
                defaultMessage='Select this if you want your reply to be visible in the channel as well'
            />
        </Tooltip>
    );

    const channelDisplay = '~' + channelName;

    return (
        <div className='checkbox text-left mb-0'>
            <OverlayTrigger
                shouldUpdatePosition={true}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={tooltip}
            >
                <label>
                    <input
                        type='checkbox'
                        checked={isBroadcastThreadReply}
                        onChange={() => handleBroadcastThreadReply()}
                    />
                    <FormattedMessage
                        id='rhs_thread.broadcast.channel'
                        defaultMessage='Also send to {channel}'
                        values={{channel: <b>{channelDisplay}</b>}}
                    />
                </label>
            </OverlayTrigger>
        </div>
    );
}
