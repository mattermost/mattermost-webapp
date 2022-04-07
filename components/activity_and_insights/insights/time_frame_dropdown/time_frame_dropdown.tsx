// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import ReactSelect, {ValueType} from 'react-select';

import {InsightsTimeFrames} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

type SelectOption = {
    value: string;
    label: string;
}
type Props = {
    timeFrame: SelectOption;
    setTimeFrame: (value: SelectOption) => void;
}

const TimeFrameDropdown = (props: Props) => {
    const reactStyles = {
        control: (provided: React.CSSProperties) => ({
            ...provided,
            width: '140px',
            cursor: 'pointer',
        }),
        indicatorSeparator: (provided: React.CSSProperties) => ({
            ...provided,
            display: 'none',
        }),
        option: (provided: React.CSSProperties) => ({
            ...provided,
            cursor: 'pointer',
        }),
        menuPortal: (provided: React.CSSProperties) => ({
            ...provided,
            zIndex: 100000,
        }),
    };

    const onTimeFrameChange = (selectedOption: ValueType<SelectOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            props.setTimeFrame(selectedOption);
        }
    };

    return (
        <ReactSelect
            className='react-select react-select-top'
            classNamePrefix='react-select'
            id='insightsTemporal'
            menuPortalTarget={document.body}
            styles={reactStyles}
            options={[
                {
                    value: InsightsTimeFrames.INSIGHTS_1_DAY,
                    label: localizeMessage('insights.timeFrame.today', 'Today'),
                },
                {
                    value: InsightsTimeFrames.INSIGHTS_7_DAYS,
                    label: localizeMessage('insights.timeFrame.mediumRange', 'Last 7 days'),
                },
                {
                    value: InsightsTimeFrames.INSIGHTS_28_DAYS,
                    label: localizeMessage('insights.timeFrame.longRange', 'Last 28 days'),
                },
            ]}
            clearable={false}
            onChange={onTimeFrameChange}
            value={props.timeFrame}
            aria-labelledby='changeInsightsTemporal'
        />
    );
};

export default memo(TimeFrameDropdown);
