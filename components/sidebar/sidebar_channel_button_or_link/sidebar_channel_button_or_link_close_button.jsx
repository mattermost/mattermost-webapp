// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
// @flow

import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants.jsx';

type Props = {
    handleClose?: () => void,
    channelId: string,
    channelType: string,
    teammateId?: string,
    badge?: boolean
}

export default class SidebarChannelButtonOrLinkCloseButton extends React.PureComponent<Props> {
    props: Props;

    overlayTriggerAttr = ['hover', 'focus']

    handleClose = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.handleClose) {
            this.props.handleClose();
        }
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
                    trigger={this.overlayTriggerAttr}
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
