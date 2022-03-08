// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import Constants from 'utils/constants';
import {Channel} from 'mattermost-redux/types/channels';
import LocalizedIcon from 'components/localized_icon';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {t} from 'utils/i18n';

interface Props {
    channel: Channel;
    isArchived: boolean;
    onClose: () => void;
}

const Icon = styled.i`
    font-size:12px;
`;

const Header = ({channel, isArchived, onClose}: Props) => {
    const closeSidebarTooltip = (
        <Tooltip id='closeSidebarTooltip'>
            <FormattedMessage
                id='rhs_header.closeSidebarTooltip'
                defaultMessage='Close'
            />
        </Tooltip>
    );

    return (
        <div className='sidebar--right__header'>
            <span className='sidebar--right__title'>
                <FormattedMessage
                    id='channel_info_rhs.header.title'
                    defaultMessage='Info'
                />
                {channel.display_name &&
                <span
                    className='style--none sidebar--right__title__subtitle'
                >
                    {isArchived && (<Icon className='icon icon-archive-outline'/>)}
                    {channel.display_name}
                </span>
                }
            </span>

            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={closeSidebarTooltip}
            >
                <button
                    id='rhsCloseButton'
                    type='button'
                    className='sidebar--right__close btn-icon'
                    aria-label='Close'
                    onClick={onClose}
                >
                    <LocalizedIcon
                        className='icon icon-close'
                        ariaLabel={{id: t('rhs_header.closeTooltip.icon'), defaultMessage: 'Close Sidebar Icon'}}
                    />
                </button>
            </OverlayTrigger>
        </div>
    );
};

export default Header;
