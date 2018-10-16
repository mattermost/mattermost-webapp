// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import BrowserStore from 'stores/browser_store.jsx';

export default class RemovedFromChannelModal extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            goToLastViewedChannel: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            channelName: '',
            remover: '',
        };
    }

    handleShow() {
        var newState = {};
        if (BrowserStore.getItem('channel-removed-state')) {
            newState = BrowserStore.getItem('channel-removed-state');
            BrowserStore.removeItem('channel-removed-state');
        }

        setTimeout(this.props.actions.goToLastViewedChannel, 1);

        this.setState(newState);
    }

    handleClose() {
        this.setState({channelName: '', remover: ''});
    }

    componentDidMount() {
        $(ReactDOM.findDOMNode(this)).on('show.bs.modal', this.handleShow);
        $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.handleClose);
    }

    componentWillUnmount() {
        $(ReactDOM.findDOMNode(this)).off('show.bs.modal', this.handleShow);
        $(ReactDOM.findDOMNode(this)).off('hidden.bs.modal', this.handleClose);
    }

    render() {
        var channelName = (
            <FormattedMessage
                id='removed_channel.channelName'
                defaultMessage='the channel'
            />
        );
        if (this.state.channelName) {
            channelName = this.state.channelName;
        }

        var remover = (
            <FormattedMessage
                id='removed_channel.someone'
                defaultMessage='Someone'
            />
        );
        if (this.state.remover) {
            remover = this.state.remover;
        }

        if (this.props.currentUserId !== '') {
            return (
                <div
                    className='modal fade'
                    ref='modal'
                    id='removed_from_channel'
                    tabIndex='-1'
                    role='dialog'
                    aria-hidden='true'
                >
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <button
                                    type='button'
                                    className='close'
                                    data-dismiss='modal'
                                    aria-label='Close'
                                >
                                    <span aria-hidden='true'>
                                        {'×'}
                                    </span>
                                </button>
                                <h4 className='modal-title'>
                                    <FormattedMessage
                                        id='removed_channel.from'
                                        defaultMessage='Removed from '
                                    />
                                    <span className='name'>{channelName}</span></h4>
                            </div>
                            <div className='modal-body'>
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
                            </div>
                            <div className='modal-footer'>
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    data-dismiss='modal'
                                >
                                    <FormattedMessage
                                        id='removed_channel.okay'
                                        defaultMessage='Okay'
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return <div/>;
    }
}
