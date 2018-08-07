// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

const WAIT_FOR_HEIGHT_TIMEOUT = 100;

export default class MarkdownImage extends React.PureComponent {
    static propTypes = {

        /*
         * The href of the image to be loaded
         */
        href: PropTypes.string,

        /*
         * A callback that is called as soon as the image component has a height value
         */
        onHeightReceived: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.heightTimeout = 0;
    }

    componentDidMount() {
        this.waitForHeight();
    }

    componentDidUpdate(prevProps) {
        if (this.props.href !== prevProps.href) {
            this.waitForHeight();
        }
    }

    componentWillUnmount() {
        this.stopWaitingForHeight();
    }

    waitForHeight = () => {
        if (this.refs.image.height) {
            if (this.props.onHeightReceived) {
                this.props.onHeightReceived(this.refs.image.height);
            }

            this.heightTimeout = 0;
        } else {
            this.heightTimeout = setTimeout(this.waitForHeight, WAIT_FOR_HEIGHT_TIMEOUT);
        }
    }

    stopWaitingForHeight = () => {
        if (this.heightTimeout !== 0) {
            clearTimeout(this.heightTimeout);
            this.heightTimeout = 0;

            return true;
        }

        return false;
    }

    handleLoad = () => {
        const wasWaiting = this.stopWaitingForHeight();

        // The image loaded before we caught its layout event, so we still need to notify that its height changed
        if (wasWaiting && this.props.onHeightReceived) {
            this.props.onHeightReceived(this.refs.image.height);
        }
    };

    handleError = () => {
        this.stopWaitingForHeight();
    };

    render() {
        const props = {...this.props};
        Reflect.deleteProperty(props, 'onHeightReceived');

        return (
            <img
                ref='image'
                {...props}
                onLoad={this.handleLoad}
                onError={this.handleError}
            />
        );
    }
}
