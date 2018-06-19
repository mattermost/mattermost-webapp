// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import Permissions from 'mattermost-redux/constants/permissions';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {PropTypes} from 'prop-types';

import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import * as Utils from 'utils/utils.jsx';

export default class ChannelCreate extends React.PureComponent {
    static propTypes = {
        channelType: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        createPublicChannel: PropTypes.func.isRequired,
        createPrivateChannel: PropTypes.func.isRequired,
        createDirectMessage: PropTypes.func.isRequired,
    };

    render() {
        const {
            channelType,
            teamId,
            createPublicChannel,
            createPrivateChannel,
            createDirectMessage,
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

        switch (channelType) {
        case 'public':
            return (
                <TeamPermissionGate
                    teamId={teamId}
                    permissions={[Permissions.CREATE_PUBLIC_CHANNEL]}
                >
                    {createPublicChannelIcon}
                </TeamPermissionGate>
            );
        case 'private':
            return (
                <TeamPermissionGate
                    teamId={teamId}
                    permissions={[Permissions.CREATE_PRIVATE_CHANNEL]}
                >
                    {createPrivateChannelIcon}
                </TeamPermissionGate>
            );
        case 'direct':
            return createDirectMessageIcon;
        case 'recent':
        case 'alpha':
            return createDirectMessageIcon;
        }

        return null;
    }
}
