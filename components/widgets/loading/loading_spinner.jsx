// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import React from 'react';
import {intlShape} from 'react-intl';

type Props = {|
    text: ?string
|};

export default class LoadingSpinner extends React.PureComponent<Props> {
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
                    className='fa fa-spinner fa-pulse spinner'
                    title={formatMessage({id: 'generic_icons.loading', defaultMessage: 'Loading Icon'})}
                />
                {this.props.text}
            </span>
        );
    }
}
