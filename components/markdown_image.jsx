// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class MarkdownImage extends React.PureComponent {
    static propTypes = {

        /*
         * dimentions object to create empty space required to prevent scroll pop
         */
        dimentions: PropTypes.object,

        /*
         * A callback that is called as soon as the image component has a height value
         */
        onHeightReceived: PropTypes.func,
    }

    handleLoad = () => {
        // image loaded but not still havent recived new post webscoket event
        // so meanwhile correct manually

        if (!this.props.dimentions && this.props.onHeightReceived) {
            this.props.onHeightReceived(this.refs.image.height);
        }
    };

    render() {
        const props = {...this.props};
        Reflect.deleteProperty(props, 'onHeightReceived');
        Reflect.deleteProperty(props, 'dimentions');

        return (
            <img
                ref={this.imageRef}
                {...props}
                onLoad={this.handleLoad}
                style={{
                    height: this.props.dimentions ? this.props.dimentions.height : 'initial',
                }}
            />
        );
    }
}
