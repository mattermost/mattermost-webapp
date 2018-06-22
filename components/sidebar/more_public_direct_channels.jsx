// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal, Tabs, Tab} from 'react-bootstrap';

import MorePublicChannels from 'components/more_channels';
import MoreDirectMessages from 'components/more_direct_channels';

export default class MoreDirectChannels extends React.Component {
    static propTypes = {
        onModalDismissed: PropTypes.func,
        handleNewChannel: PropTypes.func,
    };

    state = {
        show: true,
        key: 'channels',
    };

    handleHide = () => {
        this.setState({show: false});
    };

    handleExit = () => {
        if (this.props.onModalDismissed) {
            this.props.onModalDismissed();
        }
    };

    handleSelect = (key) => {
        this.setState({key});
    }

    render() {
        const exampleOne = (
            <Tabs
                className='modal-tabs'
                defaultActiveKey='channels'
                activeKey={this.state.key}
                onSelect={this.handleSelect}
            >
                <Tab
                    eventKey='channels'
                    title='Channels'
                >
                    <MorePublicChannels
                        handleNewChannel={this.props.handleNewChannel}
                        onModalDismissed={this.handleHide}
                        bodyOnly={true}
                    />
                </Tab>
                <Tab
                    eventKey='dm'
                    title='Direct Messages'
                >
                    <MoreDirectMessages
                        onModalDismissed={this.handleHide}
                        bodyOnly={true}
                    />
                </Tab>
            </Tabs>
        );

        return (
            <Modal
                dialogClassName={'more-modal more-direct-channels'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                {exampleOne}
            </Modal>
        );
    }
}
