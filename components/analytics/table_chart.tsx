// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import Constants from 'utils/constants.jsx';

export interface TableItem {
    tip: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
}
export interface TableChartProps {
    title: string;
    data: TableItem[];
}

export default class TableChart extends React.PureComponent<TableChartProps> {
    public static propTypes = {

        /*
         * Table title
         */
        title: PropTypes.node.isRequired,

        /*
         * Table data
         */
        data: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                tip: PropTypes.string.isRequired,
                value: PropTypes.node.isRequired,
            })
        ).isRequired,
    };

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
