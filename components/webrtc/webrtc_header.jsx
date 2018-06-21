// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

export default function WebrtcHeader(props) {
    const title = (
        <FormattedMessage
            id='webrtc.header'
            defaultMessage='Call with {username}'
            values={{
                username: props.username,
            }}
        />
    );

    const closeSidebarTooltip = (
        <Tooltip id='closeSidebarTooltip'>
            <FormattedMessage
                id='rhs_header.closeTooltip'
                defaultMessage='Close Sidebar'
            />
        </Tooltip>
    );

    const expandSidebarTooltip = (
        <Tooltip id='expandSidebarTooltip'>
            <FormattedMessage
                id='rhs_header.expandTooltip'
                defaultMessage='Expand Sidebar'
            />
        </Tooltip>
    );

    const shrinkSidebarTooltip = (
        <Tooltip id='shrinkSidebarTooltip'>
            <FormattedMessage
                id='rhs_header.expandTooltip'
                defaultMessage='Shrink Sidebar'
            />
        </Tooltip>
    );

    return (
        <div className='sidebar--right__header'>
            <span className='sidebar--right__title'>{title}</span>
            <div className='pull-right'>
                <button
                    type='button'
                    className='sidebar--right__expand'
                    aria-label='Expand'
                    onClick={props.toggleSize}
                >
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={expandSidebarTooltip}
                    >
                        <i
                            className='fa fa-expand'
                            title={localizeMessage('rhs_header.expandSidebarTooltip.icon', 'Expand Sidebar Icon')}
                        />
                    </OverlayTrigger>
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={shrinkSidebarTooltip}
                    >
                        <i
                            className='fa fa-compress'
                            title={localizeMessage('rhs_header.expandTooltip.icon', 'Shrink Sidebar Icon')}
                        />
                    </OverlayTrigger>
                </button>
                <button
                    type='button'
                    className='sidebar--right__close'
                    aria-label='Close'
                    title='Close'
                    onClick={props.onClose}
                >
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={closeSidebarTooltip}
                    >
                        <i
                            className='fa fa-sign-out'
                            title={localizeMessage('rhs_header.closeTooltip.icon', 'Close Sidebar Icon')}
                        />
                    </OverlayTrigger>
                </button>
            </div>
        </div>
    );
}

WebrtcHeader.propTypes = {
    username: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    toggleSize: PropTypes.func,
};
