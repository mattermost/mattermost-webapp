// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class RootPortal extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
    }

    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        const rootPortal = document.getElementById('root-portal');
        if (rootPortal) {
            rootPortal.appendChild(this.el);
        }
    }

    componentWillUnmount() {
        const rootPortal = document.getElementById('root-portal');
        if (rootPortal) {
            rootPortal.removeChild(this.el);
        }
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el,
        );
    }
}
