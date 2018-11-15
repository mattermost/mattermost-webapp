// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

export default class RemovedFromChannelModal extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        onHide: PropTypes.func.isRequired,
        channelName: PropTypes.string,
        remover: PropTypes.string,
        actions: PropTypes.shape({
            goToLastViewedChannel: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.state = {show: true};
    }

    componentDidMount() {
        this.props.actions.goToLastViewedChannel();
    }

    onHide = () => {
        this.setState({show: false});
    }

    render() {
        let channelName = (
            <FormattedMessage
                id='removed_channel.channelName'
                defaultMessage='the channel'
            />
        );
        if (this.props.channelName) {
            channelName = this.props.channelName;
        }

        let remover = (
            <FormattedMessage
                id='removed_channel.someone'
                defaultMessage='Someone'
            />
        );
        if (this.props.remover) {
            remover = this.props.remover;
        }

        if (this.props.currentUserId === '') {
            return null;
        }

        return (
            <Modal
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='removed_channel.from'
                            defaultMessage='Removed from '
                        />
                        <span className='name'>
                            {channelName}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref='modalBody'>
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
                        onClick={this.onHide}
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
