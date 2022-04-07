// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {selectChannel} from 'mattermost-redux/actions/channels';

import TopChannels from './top_channels/top_channels';

import './../activity_and_insights.scss';

const Insights = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(selectChannel(''));
    }, []);

    return (
        <>
            <TopChannels/>
        </>
    );
};

export default memo(Insights);
