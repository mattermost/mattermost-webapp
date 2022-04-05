// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import '../skeleton_loader.scss';

const LineChartLoader = () => {
    return (
        <div className='skeleton-loader line-chart'/>
    );
};

export default memo(LineChartLoader);
