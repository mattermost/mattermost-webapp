// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';

import './progress_bar.scss';

export interface ProgressBarProps {
    percentage: number;
    width: number;
    title?: React.ReactElement;
    extraClass?: string;
    clickProgressBar?: () => void;
}

const calculateFillingPercentage = (percentage: number, width: number) => {
    const initial = width / 100;
    return (percentage * initial).toString();
};

const ProgressBar: React.FC<ProgressBarProps> = (props: ProgressBarProps) => {
    const percetageText = `${props.percentage}%`;
    const percentage = calculateFillingPercentage(props.percentage, props.width);
    const viewBoxVal = `0 0 ${props.width} 4`;
    const clickableClass = props.clickProgressBar && typeof props.clickProgressBar === 'function' ? 'clickable' : '';
    const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
        e.preventDefault();
        if (props.clickProgressBar && typeof props.clickProgressBar === 'function') {
            props.clickProgressBar();
        }
    };
    return (
        <div
            className={`ProgressBar ${clickableClass} ${props.extraClass || null}`}
            onClick={(e) => handleClick(e)}
        >
            {props.title || null}
            <svg
                width={props.width}
                height='4'
                viewBox={viewBoxVal}
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <rect
                    width={props.width}
                    height='4'
                    rx='2'
                    fill='#3D3C40'
                    fillOpacity='0.16'
                />
                <rect
                    width={percentage}
                    height='4'
                    rx='2'
                    fill='#166DE0'
                />
            </svg>
            <span className='percetageText'>{percetageText}</span>
        </div>
    );
};

export default ProgressBar;
