// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import WebrtcStore from 'stores/webrtc_store.jsx';

import WebrtcController from '../controller';

export default class WebrtcSidebar extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object,
        isOpen: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            videoCallVisible: false,
            isCaller: false,
            userId: null,
        };
    }

    componentDidMount() {
        WebrtcStore.addInitListener(this.onInitializeVideoCall);
    }

    componentWillUnmount() {
        WebrtcStore.removeInitListener(this.onInitializeVideoCall);
    }

    onShrink = () => {
        this.setState({expanded: false});
    }

    toggleSize = (e) => {
        if (e) {
            e.preventDefault();
        }
        this.setState((prevState) => {
            return {expanded: !prevState.expanded};
        });
    }

    onInitializeVideoCall = (userId, isCaller) => {
        let expanded = this.state.expanded;
        if (userId === null) {
            expanded = false;
        }
        this.setState({
            videoCallVisible: (userId !== null),
            isCaller,
            userId,
            expanded,
        });
    }

    render() {
        let content = null;

        if (this.state.videoCallVisible) {
            content = (
                <WebrtcController
                    currentUser={this.state.currentUser}
                    userId={this.state.userId}
                    isCaller={this.state.isCaller}
                    expanded={this.state.expanded}
                    toggleSize={this.toggleSize}
                />
            );
        }

        return (
            <div
                className={classNames('sidebar--right', 'webrtc', {
                    'webrtc--show': this.props.isOpen,
                    'sidebar--right--expanded': this.state.expanded,
                    'move--left': this.props.isOpen,
                })}
            >
                <div
                    onClick={this.onShrink}
                    className='sidebar--right__bg'
                />
                <div className='sidebar-right-container'>
                    {content}
                </div>
            </div>
        );
    }
}
