// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class StatisticCount extends React.PureComponent {
    static propTypes = {

        /*
         * Statistic title
         */
        title: PropTypes.node.isRequired,

        /*
         * Statistic icon
         */
        icon: PropTypes.string.isRequired,

        /*
         * Data count
         */
        count: PropTypes.number,
    }

    render() {
        const loading = (
            <FormattedMessage
                id='analytics.chart.loading'
                defaultMessage='Loading...'
            />
        );

        return (
            <div className='col-lg-3 col-md-4 col-sm-6'>
                <div className='total-count'>
                    <div className='title'>
                        {this.props.title}
                        <i className={'fa ' + this.props.icon}/>
                    </div>
                    <div className='content'>{isNaN(this.props.count) ? loading : this.props.count}</div>
                </div>
            </div>
        );
    }
}
