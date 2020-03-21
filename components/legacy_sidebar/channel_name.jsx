// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import {PropTypes} from 'prop-types';

import OverlayTrigger from 'components/overlay_trigger';

import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

const clickableChannelHeader = ['recent', 'alpha'];

export default class ChannelName extends React.PureComponent {
    static propTypes = {
        sectionType: PropTypes.string.isRequired,
        channelName: PropTypes.string.isRequired,
        browsePublicDirectChannels: PropTypes.func.isRequired,
    };

    sectionTypeFormatMessageId = (sectionType) => {
        switch (sectionType) {
        case 'public':
            return t('sidebar.types.public');
        case 'private':
            return t('sidebar.types.private');
        case 'direct':
            return t('sidebar.types.direct');
        case 'favorite':
            return t('sidebar.types.favorite');
        case 'unreads':
            return t('sidebar.types.unreads');
        case 'recent':
            return t('sidebar.types.recent');
        default:
            return t('sidebar.types.alpha');
        }
    }

    render() {
        const {sectionType, channelName, browsePublicDirectChannels} = this.props;

        let tooltipTriggers = ['hover', 'focus'];

        if (Utils.isMobile()) {
            tooltipTriggers = [];
        }

        const formattedMessageId = this.sectionTypeFormatMessageId(sectionType);
        let name = (
            <FormattedMessage
                id={formattedMessageId}
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
                        role='presentation'
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
