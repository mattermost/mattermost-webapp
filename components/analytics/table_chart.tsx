// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import Constants from 'utils/constants.jsx';

export interface TableItem {
    name: string;
    tip: string;
    value: React.ReactNode;
}
export interface TableChartProps {
    title: React.ReactNode;
    data: TableItem[];
}

export default class TableChart extends React.PureComponent<TableChartProps> {
    public render() {
        return (
            <div className='col-sm-6'>
                <div className='total-count recent-active-users'>
                    <div className='title'>
                        {this.props.title}
                    </div>
                    <div className='content'>
                        <table>
                            <tbody>
                                {
                                    this.props.data.map((item) => {
                                        const tooltip = (
                                            <Tooltip id={'tip-table-entry-' + item.name}>
                                                {item.tip}
                                            </Tooltip>
                                        );

                                        return (
                                            <tr key={'table-entry-' + item.name}>
                                                <td>
                                                    <OverlayTrigger
                                                        delayShow={Constants.OVERLAY_TIME_DELAY}
                                                        placement='top'
                                                        overlay={tooltip}
                                                    >
                                                        <time>
                                                            {item.name}
                                                        </time>
                                                    </OverlayTrigger>
                                                </td>
                                                <td>
                                                    {item.value}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
