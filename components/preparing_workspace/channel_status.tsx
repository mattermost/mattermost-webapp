// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {BadUrlReasons, UrlValidationCheck} from 'utils/url';
import Constants from 'utils/constants';

const ChannelStatus = (props: {error: UrlValidationCheck['error']}): JSX.Element => {
    let children = null;
    let className = 'Channel__status';
    if (props.error) {
        className += ' Channel__status--error';
        switch (props.error) {
        case BadUrlReasons.Empty:
            children = (
                <FormattedMessage
                    id='onboarding_wizard.channel.empty'
                    defaultMessage='Enter a channel name'
                />
            );
            break;
        case BadUrlReasons.Length:
            children = (
                <FormattedMessage
                    id='onboarding_wizard.channel.length'
                    defaultMessage='Channel name must be between {min} and {max} characters'
                    values={{
                        min: Constants.MIN_CHANNELNAME_LENGTH,
                        max: Constants.MAX_CHANNELNAME_LENGTH,
                    }}
                />
            );
            break;
        default:
            children = (
                <FormattedMessage
                    id='onboarding_wizard.channel.other'
                    defaultMessage='Invalid channel name: {reason}'
                    values={{
                        reason: props.error,
                    }}
                />
            );
            break;
        }
    }
    return <div className={className}>{children}</div>;
};

export default ChannelStatus;
