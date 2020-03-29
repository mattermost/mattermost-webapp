// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import OverlayTrigger from 'components/overlay_trigger';

import {Constants} from 'utils/constants';

export default class SidebarChannelButtonOrLinkCloseButton extends React.PureComponent {
    static propTypes = {
        handleClose: PropTypes.func,
        channelId: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        teammateId: PropTypes.string,
        badge: PropTypes.bool,
    }

    handleClose = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.props.handleClose();
    }

    render() {
        let closeButton = null;

        if (this.props.handleClose && !this.props.badge) {
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

            closeButton = (
                <OverlayTrigger
                    delayShow={1000}
                    placement='top'
                    overlay={removeTooltip}
                >
                    <span
                        onClick={this.handleClose}
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
