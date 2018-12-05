// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';

import loadingGif from 'images/load.gif';

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

        let spinner = (
            <span
                className='fa fa-spinner fa-pulse spinner'
                title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
            />
        );
        if (type === 'bars') {
            spinner = (
                <img
                    className='spinner'
                    src={loadingGif}
                />
            );
        }

        return (
            <span className={'loading-component' + (text ? ' with-text' : '')}>
                {spinner}
                {text}
            </span>
        );
    }
}
