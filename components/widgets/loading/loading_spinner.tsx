// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

type Props = {
    intl: IntlShape;
    text?: React.ReactNode;
}

class LoadingSpinner extends React.PureComponent<Props> {
    public render() {
        const {formatMessage} = this.props.intl;
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

export default injectIntl(LoadingSpinner);
