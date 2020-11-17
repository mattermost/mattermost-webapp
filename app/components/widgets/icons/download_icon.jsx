// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

export default function DownloadIcon(props) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='40px'
                height='40px'
                viewBox='0 0 42 42'
                role='img'
                aria-label={formatMessage({id: t('generic_icons.download'), defaultMessage: 'Download Icon'})}
            >
                <g
                    stroke='inherit'
                    strokeWidth='1'
                    fill='none'
                    fillRule='evenodd'
                >
                    <g transform='translate(-986.000000, -1142.000000)'>
                        <g transform='translate(50.000000, 1034.000000)'>
                            <g transform='translate(539.000000, 54.000000)'>
                                <g transform='translate(398.000000, 55.000000)'>
                                    <g
                                        transform='translate(11.000000, 11.000000)'
                                        fillRule='nonzero'
                                        fill='inherit'
                                    >
                                        <path d='M8.7345,14.1405 C8.74725,14.1525 8.763,14.15775 8.7765,14.16825 C8.802,14.18775 8.82675,14.20875 8.85675,14.22075 C8.9025,14.24025 8.95125,14.25 9,14.25 C9.04875,14.25 9.0975,14.24025 9.14325,14.22075 C9.18975,14.20125 9.23175,14.17275 9.267,14.1375 L13.764,9.6405 C13.91025,9.49425 13.91025,9.2565 13.764,9.11025 C13.61775,8.964 13.38,8.964 13.23375,9.11025 L9.375,12.969 L9.375,0.375 C9.375,0.168 9.207,0 9,0 C8.793,0 8.625,0.168 8.625,0.375 L8.625,12.9705 L4.76475,9.11025 C4.6185,8.964 4.38075,8.964 4.2345,9.11025 C4.08825,9.2565 4.08825,9.49425 4.2345,9.6405 L8.7345,14.1405 Z M17.25,13.5 C17.043,13.5 16.875,13.668 16.875,13.875 L16.875,17.25 L1.125,17.25 L1.125,13.875 C1.125,13.668 0.957,13.5 0.75,13.5 C0.543,13.5 0.375,13.668 0.375,13.875 L0.375,17.625 C0.375,17.832 0.543,18 0.75,18 L17.25,18 C17.457,18 17.625,17.832 17.625,17.625 L17.625,13.875 C17.625,13.668 17.457,13.5 17.25,13.5 Z'/>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </span>
    );
}

