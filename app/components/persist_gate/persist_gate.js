// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

// This component mirrors redux-persist v5's PersistGate component, but it
// is built to support redux-persist v4 which we use
export default class PersistGate extends React.PureComponent {
    static propTypes = {

        /**
         * Whether or not the local storage has been initialized
         */
        initialized: PropTypes.bool.isRequired,

        /**
         * What to show while waiting for local storage to be initialized
         */
        loading: PropTypes.node,

        /**
         * The children that will be rendered once storage has been initialized
         */
        children: PropTypes.node.isRequired,
    };

    render() {
        if (!this.props.initialized) {
            return this.props.loading;
        }

        return this.props.children;
    }
}
