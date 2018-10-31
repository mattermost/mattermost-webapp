// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import {ModalIdentifiers} from 'utils/constants.jsx';

export default class RemovedFromChannelModal extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about townsquare
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * String with name of currently selected channel
         */
        channelName: PropTypes.string,

        /**
         * String with name of admin who removed currentUser from channel
         */
        remover: PropTypes.string,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to close modal
             */
            closeModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            show: true,
        };
    }

    handleClose = () => {
        this.setState({show: false});
    }

    handleExited = () => {
        this.props.actions.closeModal(ModalIdentifiers.REMOVED_FROM_CHANNEL);
    }

    render() {
        const {currentUser} = this.props;

        var channelName = (
            <FormattedMessage
                id='removed_channel.channelName'
                defaultMessage='the channel'
            />
        );

        if (this.props.channelName) {
            channelName = this.props.channelName;
        }

        var remover = (
            <FormattedMessage
                id='removed_channel.someone'
                defaultMessage='Someone'
            />
        );

        if (this.props.remover) {
            remover = this.props.remover;
        }

        if (!currentUser) {
            return null;
        }

        return (
            <Modal
                show={this.state.show}
                onHide={this.handleClose}
                onExited={this.handleExited}
                id={ModalIdentifiers.REMOVED_FROM_CHANNEL}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='removed_channel.from'
                            defaultMessage='Removed from '
                        />
                        <span className='name'>{channelName}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <FormattedMessage
                            id='removed_channel.remover'
                            defaultMessage='{remover} removed you from {channel}'
                            values={{
                                remover,
                                channel: (channelName),
                            }}
                        />
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-primary'
                        data-dismiss='modal'
                        onClick={this.handleClose}
                    >
                        <FormattedMessage
                            id='removed_channel.okay'
                            defaultMessage='Okay'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}