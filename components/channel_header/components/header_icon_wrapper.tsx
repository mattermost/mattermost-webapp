// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

import {localizeMessage} from 'utils/utils.jsx';
import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';

type Props = {
    ariaLabel?: boolean;
    buttonClass?: string;
    buttonId: string;
    iconComponent: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    tooltipKey: string;
    tooltipText?: React.ReactNode;
    isRhsOpen?: boolean;
}

type TooltipInfo = {
    class: string;
    id: string;
    messageID: string;
    message: string;
}

const HeaderIconWrapper: React.FC<Props> = (props: Props) => {
    const {
        ariaLabel,
        buttonClass,
        buttonId,
        iconComponent,
        onClick,
        tooltipKey,
        tooltipText,
        isRhsOpen,
    } = props;

    const toolTips: Record<string, TooltipInfo> = {
        flaggedPosts: {
            class: 'text-nowrap',
            id: 'flaggedTooltip',
            messageID: t('channel_header.flagged'),
            message: 'Saved posts',
        },
        pinnedPosts: {
            class: 'pinned-posts',
            id: 'pinnedPostTooltip',
            messageID: t('channel_header.pinnedPosts'),
            message: 'Pinned posts',
        },
        recentMentions: {
            class: '',
            id: 'recentMentionsTooltip',
            messageID: t('channel_header.recentMentions'),
            message: 'Recent mentions',
        },
        search: {
            class: '',
            id: 'searchTooltip',
            messageID: t('channel_header.search'),
            message: 'Search',
        },
        channelFiles: {
            class: 'channel-files',
            id: 'channelFilesTooltip',
            messageID: t('channel_header.channelFiles'),
            message: 'Channel files',
        },
    };

    function getTooltip(key: string) {
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
            <div>
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
};

export default HeaderIconWrapper;
