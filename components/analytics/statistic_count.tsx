// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    title: ReactNode;
    icon: string;
    count?: number;
    id?: string;
}

export default class StatisticCount extends React.PureComponent<Props> {
    public render(): JSX.Element {
        const loading = (
            <FormattedMessage
                id='analytics.chart.loading'
                defaultMessage='Loading...'
            />
        );

        return (
            <div className='col-lg-3 col-md-4 col-sm-6'>
                <div className='total-count'>
                    <div
                        data-testid={`${this.props.id}Title`}
                        className='title'
                    >
                        {this.props.title}
                        <i className={'fa ' + this.props.icon}/>
                    </div>
                    <div
                        data-testid={this.props.id}
                        className='content'
                    >
                        {typeof this.props.count === 'undefined' || isNaN(this.props.count) ? loading : this.props.count}
                    </div>
                </div>
            </div>
        );
    }
}
