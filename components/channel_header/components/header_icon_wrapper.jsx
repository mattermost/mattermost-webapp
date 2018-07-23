// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {Constants} from 'utils/constants.jsx';

export default function HeaderIconWrapper({
    iconComponent,
    buttonClass,
    buttonId,
    onClick,
    tooltipKey,
}) {
    function getTooltip(key) {
        const toolTips = {
            flaggedPosts: {
                class: 'text-nowrap',
                id: 'flaggedTooltip',
                messageID: 'channel_header.flagged',
                message: 'Flagged Posts',
            },
            pinnedPosts: {
                class: '',
                id: 'pinnedPostTooltip',
                messageID: 'channel_header.pinnedPosts',
                message: 'Pinned Posts',
            },
            recentMentions: {
                class: '',
                id: 'recentMentionsTooltip',
                messageID: 'channel_header.recentMentions',
                message: 'Recent Mentions',
            },
            search: {
                class: '',
                id: 'searchTooltip',
                messageID: 'channel_header.search',
                message: 'Search',
            },
        };

        if (toolTips[key] == null) {
            return null;
        }

        return (
            <Tooltip
                id={toolTips[key].id}
                className={toolTips[key].class}
            >
                <FormattedMessage
                    id={toolTips[key].messageID}
                    defaultMessage={toolTips[key].message}
                />
            </Tooltip>
        );
    }

    const tooltip = getTooltip(tooltipKey);
    if (tooltip) {
        return (
            <div className='flex-child'>
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={tooltip}
                >
                    <button
                        id={buttonId}
                        className={buttonClass || 'channel-header__icon icon--hidden style--none'}
                        onClick={onClick}
                    >
                        {iconComponent}
                    </button>
                </OverlayTrigger>
            </div>
        );
    }

    return (
        <div className='flex-child'>
            <button
                id={buttonId}
                className={buttonClass || 'channel-header__icon icon--hidden style--none'}
                onClick={onClick}
            >
                {iconComponent}
            </button>
        </div>
    );
}

HeaderIconWrapper.propTypes = {
    buttonClass: PropTypes.string,
    buttonId: PropTypes.string.isRequired,
    iconComponent: PropTypes.element.isRequired,
    onClick: PropTypes.func.isRequired,
    tooltipKey: PropTypes.string,
};
