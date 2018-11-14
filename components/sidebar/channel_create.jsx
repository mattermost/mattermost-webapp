// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {PropTypes} from 'prop-types';

import * as Utils from 'utils/utils.jsx';

export default class ChannelCreate extends React.PureComponent {
    static propTypes = {
        sectionType: PropTypes.string.isRequired,
        createPublicChannel: PropTypes.func.isRequired,
        createPrivateChannel: PropTypes.func.isRequired,
        createDirectMessage: PropTypes.func.isRequired,
        createPublicDirectChannel: PropTypes.func.isRequired,
        canCreatePublicChannel: PropTypes.bool.isRequired,
        canCreatePrivateChannel: PropTypes.bool.isRequired,
    };

    getTooltipTriggers = () => {
        if (Utils.isMobile()) {
            return [];
        }

        return ['hover', 'focus'];
    };

    renderPublic = () => {
        if (!this.props.canCreatePublicChannel) {
            return null;
        }

        const tooltipTriggers = this.getTooltipTriggers();

        const tooltip = (
            <Tooltip id='new-channel-tooltip' >
                <FormattedMessage
                    id='sidebar.createChannel'
                    defaultMessage='Create new public channel'
                />
            </Tooltip>
        );

        return (
            <OverlayTrigger
                trigger={tooltipTriggers}
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <button
                    id='createPublicChannel'
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.props.createPublicChannel}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );
    };

    renderPrivate = () => {
        if (!this.props.canCreatePrivateChannel) {
            return null;
        }

        const tooltipTriggers = this.getTooltipTriggers();

        const tooltip = (
            <Tooltip id='new-group-tooltip'>
                <FormattedMessage
                    id='sidebar.createGroup'
                    defaultMessage='Create new private channel'
                />
            </Tooltip>
        );

        return (
            <OverlayTrigger
                trigger={tooltipTriggers}
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <button
                    id='createPrivateChannel'
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.props.createPrivateChannel}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );
    };

    renderDirect = () => {
        const tooltip = (
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

        return (
            <OverlayTrigger
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <button
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.props.createDirectMessage}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );
    };

    renderCombined = () => {
        const {canCreatePublicChannel, canCreatePrivateChannel} = this.props;

        if (canCreatePublicChannel && !canCreatePrivateChannel) {
            return this.renderPublic();
        }

        if (canCreatePrivateChannel && !canCreatePublicChannel) {
            return this.renderPrivate();
        }

        if (!canCreatePublicChannel && !canCreatePrivateChannel) {
            return null;
        }

        const tooltip = (
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

        return (
            <OverlayTrigger
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <button
                    className='add-channel-btn cursor--pointer style--none'
                    onClick={this.props.createPublicDirectChannel}
                >
                    {'+'}
                </button>
            </OverlayTrigger>
        );
    };

    render() {
        const {sectionType} = this.props;

        switch (sectionType) {
        case 'public':
            return this.renderPublic();
        case 'private':
            return this.renderPrivate();
        case 'direct':
            return this.renderDirect();
        case 'recent':
        case 'alpha':
            return this.renderCombined();
        }

        return null;
    }
}
