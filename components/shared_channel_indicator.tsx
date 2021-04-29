// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {ChannelType} from 'mattermost-redux/types/channels';

import OverlayTrigger from 'components/overlay_trigger';
import {Constants} from 'utils/constants';

type Props = {
    className?: string;
    channelType: ChannelType;
    withTooltip?: boolean;
};

const SharedChannelIndicator: React.FC<Props> = (props: Props): JSX.Element => {
    let sharedIcon;
    if (props.channelType === Constants.PRIVATE_CHANNEL) {
        sharedIcon = (<i className={`${props.className || ''} icon-circle-multiple-outline-lock`}/>);
    } else {
        sharedIcon = (<i className={`${props.className || ''} icon-circle-multiple-outline`}/>);
    }

    if (!props.withTooltip) {
        return sharedIcon;
    }

    const sharedTooltip = (
        <Tooltip id='sharedTooltip'>
            <FormattedMessage
                id='shared_channel_indicator.tooltip'
                defaultMessage='Shared with trusted organizations'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={sharedTooltip}
        >
            {sharedIcon}
        </OverlayTrigger>
    );
};

export default SharedChannelIndicator;
