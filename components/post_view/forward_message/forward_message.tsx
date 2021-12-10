// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {ModalData} from 'types/actions';

import { ModalIdentifiers } from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import ForwardMessageModal from 'components/forward_message_modal';

type Props = {
        teamId: string;
        channelId: string;
        location?: 'RHS'; //
        postId: string,
        actions: {
            openModal: <P>(modalData: ModalData<P>) => void;
        },
}

type State = {
    /* */
}

export default class ForwardMessage extends React.PureComponent<Props, State> { // TODO

    public static defaultProps: Partial<Props> = {
        // location: Locations.CENTER,
    }

    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            // a11yActive: false,
        };

        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    openForwardModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        // trackEvent('ui', 'ui_sidebar_open_channel_switcher_v2');

        this.props.actions.openModal({
            modalId: ModalIdentifiers.FORWARD_MESSAGE_MODAL,
            dialogType: ForwardMessageModal,
            dialogProps: {postId: this.props.postId, teamId: this.props.teamId, channelId: this.props.channelId}
        });
    }

    render() {
        return (
            <OverlayTrigger
                className='hidden-xs'
                key={`forwardtooltipkey`}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip
                        id='forwardTooltip'
                        className='hidden-xs'
                    >
                        <FormattedMessage
                            id={'forward_message'}
                            defaultMessage={'Forward message'}
                        />
                    </Tooltip>
                }
            >
                <button
                    ref={this.buttonRef}
                    id={`${this.props.location}_forwardIcon_${this.props.postId}`}
                    aria-label={localizeMessage('forward_message.tooltip', 'Forward message').toLowerCase()}
                    className='post-menu__item'
                    onClick={this.openForwardModal}
                >
                    <i className='icon icon-arrow-right-bold-outline'/>
                </button>
            </OverlayTrigger>
        );
    }
}
