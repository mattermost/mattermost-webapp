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
        sectionType: PropTypes.string.isRequired,
        channelName: PropTypes.string.isRequired,
        browsePublicDirectChannels: PropTypes.func.isRequired,
    };

    render() {
        const {sectionType, channelName, browsePublicDirectChannels} = this.props;

        let tooltipTriggers = ['hover', 'focus'];

        if (Utils.isMobile()) {
            tooltipTriggers = [];
        }

        let name = (
            <FormattedMessage
                id={`sidebar.types.${sectionType}`}
                defaultMessage={channelName}
            />
        );

        if (clickableChannelHeader.indexOf(sectionType) !== -1) {
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
                        className='public_direct_name'
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
