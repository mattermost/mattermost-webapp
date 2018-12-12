// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingIndicator from './loading_indicator.jsx';

export default class LoadingWrapper extends React.Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        text: PropTypes.string,
        type: PropTypes.string.isRequired,
        children: PropTypes.node,
    }

    static defaultProps = {
        loading: true,
        text: null,
        type: 'spinner',
        children: null,
    }

    render() {
        const {text, type, loading, children} = this.props;
        if (!loading) {
            return children;
        }

        return (
            <LoadingIndicator
                text={text}
                type={type}
            />
        );
    }
}
