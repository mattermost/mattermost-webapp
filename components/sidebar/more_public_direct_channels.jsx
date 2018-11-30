// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal, Tabs, Tab} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import MorePublicChannels from 'components/more_channels';
import MoreDirectMessages from 'components/more_direct_channels';

import {localizeMessage} from 'utils/utils';

export default class MorePublicDirectChannels extends React.PureComponent {
    static propTypes = {
        handleNewChannel: PropTypes.func,
        onModalDismissed: PropTypes.func,
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
        return (
            <Modal
                dialogClassName={'more-modal more-direct-channels more-public-direct-channels'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='more_public_direct_channels.title'
                            defaultMessage='Channels and Direct Messages'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        id='morePublicDirectChannelTabs'
                        className='modal-tabs'
                        defaultActiveKey='channels'
                        activeKey={this.state.key}
                        onSelect={this.handleSelect}
                    >
                        <Tab
                            eventKey='channels'
                            title={localizeMessage('more_public_direct_channels.channels', 'Channels')}
                        >
                            <MorePublicChannels
                                handleNewChannel={this.props.handleNewChannel}
                                onModalDismissed={this.handleHide}
                                bodyOnly={true}
                            />
                        </Tab>
                        <Tab
                            eventKey='dm'
                            title={localizeMessage('more_public_direct_channels.direct_messages', 'Direct Messages')}
                        >
                            <MoreDirectMessages
                                onModalDismissed={this.handleHide}
                                isExistingChannel={false}
                                bodyOnly={true}
                            />
                        </Tab>
                    </Tabs>
                </Modal.Body>
            </Modal>
        );
    }
}
