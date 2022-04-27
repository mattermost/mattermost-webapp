// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import UsagePercentBar from 'components/common/usage_percent_bar';

type Props = {
    name: JSX.Element;
    status: JSX.Element;
    percent: number;
    icon: string;
};

const LimitCard = (props: Props) => {
    return (<div className='ProductLimitCard'>
        <div className='ProductLimitCard__name'>
            <i className={props.icon}/>
            {props.name}
        </div>
        <div className=''>
            {props.status}
        </div>
        <UsagePercentBar
            percent={props.percent}
            barWidth={155}
        />
    </div>);
};
export default LimitCard;
