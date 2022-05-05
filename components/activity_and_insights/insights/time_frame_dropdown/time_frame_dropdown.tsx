// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import ReactSelect, {ValueType} from 'react-select';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import {TimeFrames} from '@mattermost/types/insights';

import {localizeMessage} from 'utils/utils';

import './time_frame_dropdown.scss';

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
            fontSize: '12px',
            lineHeight: '16px',
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
            zIndex: 1100,
        }),
    };

    const onTimeFrameChange = (selectedOption: ValueType<SelectOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            props.setTimeFrame(selectedOption);
        }
    };

    const CustomDropwdown = () => {
        return (
            <span className='icon'>
                <Icon
                    size={12}
                    glyph={'chevron-down'}
                />
            </span>
        );
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
                    value: TimeFrames.INSIGHTS_1_DAY,
                    label: localizeMessage('insights.timeFrame.today', 'Today'),
                },
                {
                    value: TimeFrames.INSIGHTS_7_DAYS,
                    label: localizeMessage('insights.timeFrame.mediumRange', 'Last 7 days'),
                },
                {
                    value: TimeFrames.INSIGHTS_28_DAYS,
                    label: localizeMessage('insights.timeFrame.longRange', 'Last 28 days'),
                },
            ]}
            clearable={false}
            onChange={onTimeFrameChange}
            value={props.timeFrame}
            aria-labelledby='changeInsightsTemporal'
            components={{
                DropdownIndicator: CustomDropwdown,
            }}
        />
    );
};

export default memo(TimeFrameDropdown);
