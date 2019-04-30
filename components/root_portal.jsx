// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class RootPortal extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    }

    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        document.getElementById('root-portal').appendChild(this.el);
    }

    componentWillUnmount() {
        document.getElementById('root-portal').removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el,
        );
    }
}
