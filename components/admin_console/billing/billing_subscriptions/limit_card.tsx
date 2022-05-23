// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import UsagePercentBar from 'components/common/usage_percent_bar';

import './limit_card.scss';

type Props = {
    name: JSX.Element;
    status: JSX.Element;
    percent: number;
    icon: string;
    barWidth?: string;
    fullWidth?: boolean;
};

const LimitCard = (props: Props) => {
    const barWidth = props.barWidth === undefined ? 155 : props.barWidth;
    let className = 'ProductLimitCard';
    if (props.fullWidth) {
        className += ' ProductLimitCard--full-width';
    }
    return (<div className={className}>
        <div className='ProductLimitCard__name'>
            <i className={props.icon}/>
            {props.name}
        </div>
        <div className='ProductLimitCard__status'>
            {props.status}
        </div>
        <UsagePercentBar
            percent={props.percent}
            barWidth={barWidth}
        />
    </div>);
};
export default LimitCard;
