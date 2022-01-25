// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

// import ScoreEllipseSvg from 'components/common/svg_images_components/score_ellipse_svg';
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
                    id={'admin.reporting.workspace_optimization.suggestions'}
                    defaultMessage={'Suggestions'}
                />
            );
            break;
        case 'warning':
            chipLegend = (
                <FormattedMessage
                    id={'admin.reporting.workspace_optimization.warnings'}
                    defaultMessage={'Warnings'}
                />
            );
            break;
        case 'error':
        default:
            chipLegend = (
                <FormattedMessage
                    id={'admin.reporting.workspace_optimization.problems'}
                    defaultMessage={'Problems'}
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
