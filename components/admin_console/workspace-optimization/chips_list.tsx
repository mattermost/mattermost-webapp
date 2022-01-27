// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import Chip from 'components/common/chip/chip';

import './dashboard.scss';

type ChipsInfoKeys = 'info' | 'warning' | 'error';

export type ChipsInfoType = { [key in ChipsInfoKeys]: number };

type ChipsListProps = {
    chipsData: ChipsInfoType;
};

const ChipsList = ({
    chipsData,
}: ChipsListProps): JSX.Element | null => {
    const chipsList = Object.entries(chipsData).map(([chipKey, count]) => {
        if (count === 0) {
            return false;
        }
        let chipLegend;

        switch (chipKey) {
        case 'info':
            chipLegend = (
                <FormattedMessage
                    id={'admin.reporting.workspace_optimization.chip_suggestions'}
                    defaultMessage={'Suggestions: {count}'}
                    values={{count}}
                />
            );
            break;
        case 'warning':
            chipLegend = (
                <FormattedMessage
                    id={'admin.reporting.workspace_optimization.chip_warnings'}
                    defaultMessage={'Warnings: {count}'}
                    values={{count}}
                />
            );
            break;
        case 'error':
        default:
            chipLegend = (
                <FormattedMessage
                    id={'admin.reporting.workspace_optimization.chip_problems'}
                    defaultMessage={'Problems: {count}'}
                    values={{count}}
                />
            );
            break;
        }

        return (
            <Chip
                key={chipKey}
                additionalMarkup={chipLegend}
                className={chipKey}
            />
        );
    });
    return (
        <>
            {chipsList}
        </>
    );
};

export default ChipsList;
