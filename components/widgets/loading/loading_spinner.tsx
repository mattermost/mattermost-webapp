// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {intlShape} from 'react-intl';

type Props = {
    text: React.ReactNode;
}

export default class LoadingSpinner extends React.PureComponent<Props> {
    public static defaultProps = {
        text: null,
    }

    public static contextTypes = {
        intl: intlShape.isRequired,
    };

    public render() {
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
