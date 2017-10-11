// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default function StatisticCount(props) {
    const loading = (
        <FormattedMessage
            id='analytics.chart.loading'
            defaultMessage='Loading...'
        />
    );

    return (
        <div className='col-md-3 col-sm-6'>
            <div className='total-count'>
                <div className='title'>
                    {props.title}
                    <i className={'fa ' + props.icon}/>
                </div>
                <div className='content'>{props.count == null ? loading : props.count}</div>
            </div>
        </div>
    );
}

StatisticCount.propTypes = {
    title: PropTypes.node.isRequired,
    icon: PropTypes.string.isRequired,
    count: PropTypes.number
};
