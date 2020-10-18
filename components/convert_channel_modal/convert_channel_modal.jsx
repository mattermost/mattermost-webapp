// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import Constants from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class ConvertChannelModal extends React.PureComponent {
    static propTypes = {

        /**
        * Function called when modal is dismissed
        */
        onHide: PropTypes.func.isRequired,
        channelId: PropTypes.string.isRequired,
        channelDisplayName: PropTypes.string.isRequired,

        actions: PropTypes.shape({

            /**
            * Function called for converting channel to private,
            */
            convertChannelToPrivate: PropTypes.func.isRequired,
        }),
    }

    constructor(props) {
        super(props);

        this.state = {show: true};
    }

    handleConvert = () => {
        const {actions, channelId} = this.props;
        if (channelId.length !== Constants.CHANNEL_ID_LENGTH) {
            return;
        }

        actions.convertChannelToPrivate(channelId);
        trackEvent('actions', 'convert_to_private_channel', {channel_id: channelId});
        this.onHide();
    }

    onHide = () => {
        this.setState({show: false});
    }

    render() {
        const {
            channelDisplayName,
            onHide,
        } = this.props;

        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.state.show}
                onHide={this.onHide}
                onExited={onHide}
                role='dialog'
                aria-labelledby='convertChannelModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='convertChannelModalLabel'
                    >
                        <FormattedMessage
                            id='convert_channel.title'
                            defaultMessage='Convert {display_name} to a Private Channel?'
                            values={{
                                display_name: channelDisplayName,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMarkdownMessage
                            id='convert_channel.question1'
                            defaultMessage='When you convert **{display_name}** to a private channel, history and membership are preserved. Publicly shared files remain accessible to anyone with the link. Membership in a private channel is by invitation only.'
                            values={{
                                display_name: channelDisplayName,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='convert_channel.question2'
                            defaultMessage='The change is permanent and cannot be undone.'
                        />
                    </p>
                    <p>
                        <FormattedMarkdownMessage
                            id='convert_channel.question3'
                            defaultMessage='Are you sure you want to convert **{display_name}** to a private channel?'
                            values={{
                                display_name: channelDisplayName,
                            }}
                        />
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='convert_channel.cancel'
                            defaultMessage='No, cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        data-dismiss='modal'
                        onClick={this.handleConvert}
                        autoFocus={true}
                        data-testid='convertChannelConfirm'
                    >
                        <FormattedMessage
                            id='convert_channel.confirm'
                            defaultMessage='Yes, convert to private channel'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
