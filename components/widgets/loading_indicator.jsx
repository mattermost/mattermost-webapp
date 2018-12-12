// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';

import loadingGif from 'images/load.gif';

export default class LoadingIndicator extends React.PureComponent {
    static propTypes = {
        text: PropTypes.string,
        type: PropTypes.string.isRequired,
    }

    static defaultProps = {
        text: null,
        type: 'spinner',
    }

    render() {
        const {text, type} = this.props;

        let spinner;
        if (type === 'bars') {
            spinner = (
                <img
                    className='spinner'
                    src={loadingGif}
                />
            );
        } else {
            spinner = (
                <span
                    className='fa fa-spinner fa-pulse spinner'
                    title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                />
            );
        }

        return (
            <span className={'loading-indicator' + (text ? ' with-text' : '')}>
                {spinner}
                {text}
            </span>
        );
    }
}
