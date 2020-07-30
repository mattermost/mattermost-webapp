// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

import * as Utils from 'utils/utils';
import {localizeMessage} from 'utils/utils.jsx';
import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';

function renderShortcut(text) {
    if (!text) {
        return null;
    }

    const shortcut = text.split('\t');
    const description = <span>{shortcut[0]}</span>;

    let keys = null;
    if (shortcut.length > 1) {
        keys = shortcut[1].split('|').map((key) => (
            <span
                className='shortcut-key'
                key={key}
            >
                {key}
            </span>
        ));
    }

    return (
        <div className='shortcut-line'>
            {description}
            {keys}
        </div>
    );
}

export default function HeaderIconWrapper({
    iconComponent,
    ariaLabel,
    buttonClass,
    buttonId,
    onClick,
    tooltipKey,
    tooltipText,
    isRhsOpen,
}) {
    const toolTips = {
        flaggedPosts: {
            class: 'text-nowrap',
            id: 'flaggedTooltip',
            messageID: t('channel_header.flagged'),
            message: 'Saved posts',
            default: {
                defaultMessage: 'Recent mentions:\tCtrl|Shift|M',
            },
        },
        pinnedPosts: {
            class: '',
            id: 'pinnedPostTooltip',
            messageID: t('channel_header.pinnedPosts'),
            message: 'Pinned posts',
            default: {
                defaultMessage: 'Recent mentions:\tCtrl|Shift|M',
            },
        },
        recentMentions: {
            class: '',
            id: 'recentMentionsTooltip',
            messageID: t('channel_header.recentMentions'),
            message: 'Recent mentions',
            default: {
                id: t('shortcuts.nav.recent_mentions'),
                defaultMessage: 'Ctrl|Shift|M',
            },
            mac: {
                id: t('shortcuts.nav.recent_mentions.mac'),
                defaultMessage: 'Recent mentions:\t⌘|Shift|M',
            },
        },
        search: {
            class: '',
            id: 'searchTooltip',
            messageID: t('channel_header.search'),
            message: 'Search',
            default: {
                defaultMessage: 'Recent mentions:\tCtrl|Shift|M',
            },
        },
    };

    function getTooltip(key) {
        if (toolTips[key] == null) {
            return null;
        }

        // const isMac = Utils.ismac();
        return (
            <Tooltip
                id={toolTips[key].id}
                className={toolTips[key].class}
            >
                <FormattedMessage
                    id={toolTips[key].messageID}
                    defaultMessage={toolTips[key].message}
                />
                <p>{toolTips[key].default.defaultMessage}</p>
            </Tooltip>
        );
    }

    let tooltip;
    if (tooltipKey === 'plugin' && tooltipText) {
        tooltip = (
            <Tooltip
                id='pluginTooltip'
                className=''
            >
                <span>{tooltipText}</span>
            </Tooltip>
        );
    } else {
        tooltip = getTooltip(tooltipKey);
    }

    let ariaLabelText;
    if (ariaLabel) {
        ariaLabelText = `${localizeMessage(toolTips[tooltipKey].messageID, toolTips[tooltipKey].message)}`;
    }

    if (tooltip) {
        return (
            <div className='flex-child'>
                <OverlayTrigger
                    trigger={['hover']}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={isRhsOpen ? <></> : tooltip}
                >
                    <button
                        id={buttonId}
                        aria-label={ariaLabelText}
                        className={buttonClass || 'channel-header__icon'}
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
                className={buttonClass || 'channel-header__icon'}
                onClick={onClick}
            >
                {iconComponent}
            </button>
        </div>
    );
}

HeaderIconWrapper.propTypes = {
    ariaLabel: PropTypes.bool,
    buttonClass: PropTypes.string,
    buttonId: PropTypes.string.isRequired,
    iconComponent: PropTypes.element.isRequired,
    onClick: PropTypes.func.isRequired,
    tooltipKey: PropTypes.string,
    tooltipText: PropTypes.node,
    isRhsOpen: PropTypes.bool,
};
