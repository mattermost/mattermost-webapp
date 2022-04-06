// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import widgetHoc from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

const TopReactions = () => {
    return (
        <div className='top-reaction-container'/>
    );
};

export default memo(widgetHoc(TopReactions));
