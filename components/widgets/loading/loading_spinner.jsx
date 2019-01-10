// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';

export default class LoadingSpinner extends React.PureComponent {
    static propTypes = {
        text: PropTypes.string,
    }

    static defaultProps = {
        text: null,
    }

    render() {
        return (
            <span
                id='loadingSpinner'
                className={'LoadingSpinner' + (this.props.text ? ' with-text' : '')}
            >
                <span
                    className='fa fa-spinner fa-pulse spinner'
                    title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                />
                {this.props.text}
            </span>
        );
    }
}
