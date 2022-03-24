import React, {memo} from 'react';

import {useIntl} from 'react-intl';

import TopChannels from './top_channels/top_channels';

import './../activity_and_insights.scss';

const Insights = () => {
    const {formatMessage} = useIntl();

    return (
        <>
            <TopChannels />
        </>
    );
}

export default memo(Insights);