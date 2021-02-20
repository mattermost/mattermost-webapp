// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';
import {FormattedMessage} from 'react-intl';

import './progress_bar.scss';

export interface ProgressBarProps {
    percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = (props: ProgressBarProps) => {
    const percetageText = `${props.percentage}%`;
    return (
        <div className='ProgressBar'>
            <FormattedMessage
                id='admin.general.importInProgress'
                defaultMessage='Import in Progress'
            />
            <svg
                width='50'
                height='4'
                viewBox='0 0 50 4'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <rect
                    width='50'
                    height='4'
                    rx='2'
                    fill='#3D3C40'
                    fillOpacity='0.16'
                />
                <rect
                    width={props.percentage.toString()}
                    height='4'
                    rx='2'
                    fill='#166DE0'
                />
            </svg>
            <span>{percetageText}</span>
        </div>
    );
};

export default ProgressBar;
