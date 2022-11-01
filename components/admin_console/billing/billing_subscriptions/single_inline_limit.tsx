// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import UsagePercentBar from 'components/common/usage_percent_bar';

import './single_inline_limit.scss';

type Props = {
    name: JSX.Element;
    status: JSX.Element;
    percent: number;
    icon: string;
};

const SingleInlineLimit = (props: Props) => {
    return (<div className='SingleInlineLimit'>
        <i className={props.icon}/>
        <div className='SingleInlineLimit__center'>
            <div className='SingleInlineLimit__name'>
                {props.name}
            </div>
            <UsagePercentBar
                percent={props.percent}
                barWidth={'auto'}
            />
        </div>
        <div className='SingleInlineLimit__status'>
            {props.status}
        </div>
    </div>);
};

export default SingleInlineLimit;
