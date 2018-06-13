// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {PropTypes} from 'prop-types';

import * as Utils from 'utils/utils.jsx';

const clickableChannelHeader = ['recent', 'alpha'];

export default class ChannelName extends React.PureComponent {
    static propTypes = {
        channelType: PropTypes.string.isRequired,
        browsePublicDirectChannels: PropTypes.func.isRequired,
    };

    render() {
        const {channelType, browsePublicDirectChannels} = this.props;

        let tooltipTriggers = ['hover', 'focus'];

        if (Utils.isMobile()) {
            tooltipTriggers = [];
        }

        let name = (
            <FormattedMessage
                id={`sidebar.types.${channelType}`}
                defaultMessage={channelType}
            />
        );

        if (clickableChannelHeader.indexOf(channelType) !== -1) {
            const createPublicDirectChannelTooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    <FormattedMessage
                        id='sidebar.browseChannelDirectChannel'
                        defaultMessage='Browse Channels and Direct Messages'
                    />
                </Tooltip>
            );

            name = (
                <OverlayTrigger
                    trigger={tooltipTriggers}
                    delayShow={500}
                    placement='top'
                    overlay={createPublicDirectChannelTooltip}
                >
                    <div
                        style={{flex: 1, cursor: 'pointer'}}
                        onClick={browsePublicDirectChannels}
                    >
                        {name}
                    </div>
                </OverlayTrigger>
            );
        }

        return name;
    }
}
