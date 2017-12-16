// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {Constants} from 'utils/constants.jsx';

export default class SidebarChannelButtonOrLinkCloseButton extends React.PureComponent {
    static propTypes = {
        handleClose: PropTypes.func,
        channelId: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        badge: PropTypes.string
    }

    render() {
        let closeButton = null;

        let removeTooltip = (
            <Tooltip id='remove-dm-tooltip'>
                <FormattedMessage
                    id='sidebar.removeList'
                    defaultMessage='Remove from list'
                />
            </Tooltip>
        );

        if (this.props.channelType === Constants.OPEN_CHANNEL || this.props.channelType === Constants.PRIVATE_CHANNEL) {
            removeTooltip = (
                <Tooltip id='remove-dm-tooltip'>
                    <FormattedMessage
                        id='sidebar.leave'
                        defaultMessage='Leave channel'
                    />
                </Tooltip>
            );
        }

        if (this.props.handleClose && !this.props.badge) {
            closeButton = (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    delayShow={1000}
                    placement='top'
                    overlay={removeTooltip}
                >
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            this.props.handleClose(e, this.props.channelId);
                        }}
                        className='btn-close'
                    >
                        {'×'}
                    </span>
                </OverlayTrigger>
            );
        }
        return closeButton;
    }
}
