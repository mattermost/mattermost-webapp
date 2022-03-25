// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import TopChannels from './top_channels/top_channels';

import './../activity_and_insights.scss';

const Insights = () => {
    return (
        <>
            <TopChannels/>
        </>
    );
};

export default memo(Insights);
