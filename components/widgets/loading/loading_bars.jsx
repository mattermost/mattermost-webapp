// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import LoadingSpinner from 'components/widgets/loading/loading_spinner.jsx';

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
            <span className={(text ? 'with-text' : '')}>
                <LoadingSpinner/>
                {text}
            </span>
        );
    }
}
