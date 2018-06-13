// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {PropTypes} from 'prop-types';

import * as Utils from 'utils/utils.jsx';

export default class ChannelCreate extends React.PureComponent {
    static propTypes = {
        channelType: PropTypes.string.isRequired,
        createPublicChannel: PropTypes.func.isRequired,
        createPrivateChannel: PropTypes.func.isRequired,
        createDirectMessage: PropTypes.func.isRequired,
        createPublicDirectChannel: PropTypes.func.isRequired,
        canCreatePublicChannel: PropTypes.bool.isRequired,
        canCreatePrivateChannel: PropTypes.bool.isRequired,
    };

    render() {
        const {
            channelType,
            createPublicChannel,
            createPrivateChannel,
            createDirectMessage,
            createPublicDirectChannel,
            canCreatePublicChannel,
            canCreatePrivateChannel,
        } = this.props;

        let tooltipTriggers = ['hover', 'focus'];

        if (Utils.isMobile()) {
            tooltipTriggers = [];
        }

        const createChannelTootlip = (
            <Tooltip id='new-channel-tooltip' >
                <FormattedMessage
                    id='sidebar.createChannel'
                    defaultMessage='Create new public channel'
                />
            </Tooltip>
        );
        const createGroupTootlip = (
            <Tooltip id='new-group-tooltip'>
                <FormattedMessage
                    id='sidebar.createGroup'
                    defaultMessage='Create new private channel'
                />
            </Tooltip>
        );

        const createDirectMessageTooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id='sidebar.createDirectMessage'
                    defaultMessage='Create new direct message'
                />
            </Tooltip>
        );

        const createPublicChannelIcon = (
            <OverlayTrigger
                trigger={tooltipTriggers}
                delayShow={500}
                placement='top'
                overlay={createChannelTootlip}
            >
                <button
                    id='createPublicChannel'
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={createPublicChannel}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        const createPrivateChannelIcon = (
            <OverlayTrigger
                trigger={tooltipTriggers}
                delayShow={500}
                placement='top'
                overlay={createGroupTootlip}
            >
                <button
                    id='createPrivateChannel'
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={createPrivateChannel}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        const createDirectMessageIcon = (
            <OverlayTrigger
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={createDirectMessageTooltip}
            >
                <button
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={createDirectMessage}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        const createPublicDirectChannelTooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id='sidebar.createPublicPrivateChannel'
                    defaultMessage='Create new public or private channel'
                />
            </Tooltip>
        );

        const createPublicDirectChannelIcon = (
            <OverlayTrigger
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={createPublicDirectChannelTooltip}
            >
                <button
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={createPublicDirectChannel}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );

        switch (channelType) {
        case 'public':
            if (canCreatePublicChannel) {
                return createPublicChannelIcon;
            }
            break;
        case 'private':
            if (canCreatePrivateChannel) {
                return createPrivateChannelIcon;
            }
            break;
        case 'direct':
            return createDirectMessageIcon;
        case 'recent':
        case 'alpha': {
            let action = createPublicDirectChannelIcon;

            if (canCreatePublicChannel && !canCreatePrivateChannel) {
                action = createPublicChannelIcon;
            }

            if (canCreatePrivateChannel && !canCreatePublicChannel) {
                action = createPrivateChannelIcon;
            }

            if (!canCreatePublicChannel && !canCreatePrivateChannel) {
                action = null;
            }

            return action;
        }
        }

        return null;
    }
}
