// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingSpinner from './loading_spinner';

type Props = {
    loading: boolean,
    text: React.ReactNode,
    children: React.ReactNode,
}

export default class LoadingWrapper extends React.Component<Props> {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        text: PropTypes.node,
        children: PropTypes.node,
    }

    static defaultProps = {
        loading: true,
        text: null,
        children: null,
    }

    render() {
        const {text, loading, children} = this.props;
        if (!loading) {
            return children;
        }

        return <LoadingSpinner text={text}/>;
    }
}
