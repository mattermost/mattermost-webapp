// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';

export default class LoadingSpinner extends React.PureComponent {
    static propTypes = {
        text: PropTypes.node,
    }

    static defaultProps = {
        text: null,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    render() {
        const {formatMessage} = this.context.intl;
        return (
            <span
                id='loadingSpinner'
                className={'LoadingSpinner' + (this.props.text ? ' with-text' : '')}
            >
                <span
                    className='fa fa-spinner fa-fw fa-pulse spinner'
                    title={formatMessage({id: 'generic_icons.loading', defaultMessage: 'Loading Icon'})}
                />
                {this.props.text}
            </span>
        );
    }
}
