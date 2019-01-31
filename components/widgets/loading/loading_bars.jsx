// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class LoadingBars extends React.PureComponent {
    static propTypes = {
        text: PropTypes.string,
    }

    static defaultProps = {
        text: null,
    }

    render() {
        const {text} = this.props;

        return (
            <span className={'LoadingBars' + (text ? ' with-text' : '')}>
                <i className='fa fa-spin fa-spinner'/>
                {text}
            </span>
        );
    }
}
