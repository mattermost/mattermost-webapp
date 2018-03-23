// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants.jsx';

export default class ConvertChannelModal extends React.PureComponent {
    static propTypes = {

        /**
        * Function called when modal is dismissed
        */
        onHide: PropTypes.func.isRequired,

        /**
         * channel data
         */
        channel: PropTypes.object.isRequired,

        actions: PropTypes.shape({

            /**
            * Function called for converting channel to private,
            */
            updateChannel: PropTypes.func.isRequired,
        }),
    }

    constructor(props) {
        super(props);

        this.handleConvert = this.handleConvert.bind(this);
        this.onHide = this.onHide.bind(this);
        this.state = {show: true};
    }

    handleConvert() {
        if (this.props.channel.id.length !== Constants.CHANNEL_ID_LENGTH) {
            return;
        }
        const privateChannel = Object.assign({}, this.props.channel, {type: Constants.PRIVATE_CHANNEL});
        this.props.actions.updateChannel(privateChannel);
        trackEvent('actions', 'convert_to_private_channel', {channel_id: privateChannel.id});
        this.onHide();
    }

    onHide() {
        this.setState({show: false});
    }

    render() {
        return (
            <Modal
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <h4 className='modal-title'>
                        <FormattedMessage
                            id='convert_channel.title'
                            defaultMessage='Convert {display_name} to a private channel?'
                            values={{
                                display_name: this.props.channel.display_name,
                            }}
                        />
                    </h4>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedHTMLMessage
                            id='convert_channel.question1'
                            defaultMessage='When you convert <strong>{display_name}</strong> to a private channel, history and membership are preserved. Publicly shared files remain accessible to anyone with the link. Membership in a private channel is by invitation only.'
                            values={{
                                display_name: this.props.channel.display_name,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedHTMLMessage
                            id='convert_channel.question2'
                            defaultMessage='The change is permanent and cannot be undone.'
                        />
                    </p>
                    <p>
                        <FormattedHTMLMessage
                            id='convert_channel.question3'
                            defaultMessage='Are you sure you want to convert <strong>{display_name}</strong> to a private channel?'
                            values={{
                                display_name: this.props.channel.display_name,
                            }}
                        />
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.onHide}
                        tabIndex='2'
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
                        tabIndex='1'
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
