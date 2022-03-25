// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback} from 'react';

import InsightsHeader from './insights_header/insights_header';

import './../activity_and_insights.scss';

const Insights = () => {
    const [filterType, setFilterType] = useState('my');

    const setFilterTypeTeam = useCallback(() => {
        setFilterType('team');
    }, []);

    const setFilterTypeMy = useCallback(() => {
        setFilterType('my');
    }, []);

    return (
        <>
            <InsightsHeader
                filterType={filterType}
                setFilterTypeTeam={setFilterTypeTeam}
                setFilterTypeMy={setFilterTypeMy}
            />
        </>
    );
};

export default memo(Insights);
