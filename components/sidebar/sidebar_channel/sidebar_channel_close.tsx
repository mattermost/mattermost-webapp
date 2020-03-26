// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';

import Constants from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';

type Props = {
    channel: Channel;
    show: boolean;
    closeHandler?: (callback: () => void) => void;
};

export default class SidebarChannelClose extends React.PureComponent<Props> {
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.isLeaving = false;
    }

    handleLeaveChannel = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLeaving || !this.props.closeHandler) {
            return;
        }

        this.isLeaving = true;

        this.props.closeHandler(() => {
            this.isLeaving = false;
        });
    }

    render() {
        const {channel, closeHandler} = this.props;

        if (!(this.props.show && closeHandler)) {
            return null;
        }

        let removeTooltipMessage = (
            <FormattedMessage
                id='sidebar.removeList'
                defaultMessage='Remove from list'
            />
        );

        if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            removeTooltipMessage = (
                <FormattedMessage
                    id='sidebar.leave'
                    defaultMessage='Leave channel'
                />
            );
        }

        const closeButton = (
            <OverlayTrigger
                delayShow={1000}
                placement='top'
                overlay={(
                    <Tooltip id='remove-dm-tooltip'>
                        {removeTooltipMessage}
                    </Tooltip>
                )}
            >
                <span
                    onClick={this.handleLeaveChannel}
                    className='btn-close'
                >
                    {'×'}
                </span>
            </OverlayTrigger>
        );

        return closeButton;
    }
}
