// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {FormattedMessage} from 'react-intl';
import Chart, {ChartData} from 'chart.js';

import * as Utils from 'utils/utils.jsx';

type Props = {
    title: React.ReactNode;
    width: number;
    height: number;
    data?: ChartData;
}

export default class DoughnutChart extends React.PureComponent<Props> {
    private canvasRef = React.createRef<HTMLCanvasElement>();

    public chart: Chart | null = null;

    public componentDidMount(): void {
        this.initChart();
    }

    public componentDidUpdate(prevProps: Props): void {
        if (!Utils.areObjectsEqual(prevProps.data, this.props.data)) {
            this.initChart(true);
        }
    }

    public componentWillUnmount(): void {
        if (this.chart && this.canvasRef.current) {
            this.chart.destroy();
        }
    }

    public initChart = (update?: boolean): void => {
        if (!this.canvasRef.current) {
            return;
        }
        const ctx = this.canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        const dataCopy = JSON.parse(JSON.stringify(this.props.data));
        this.chart = new Chart(ctx, {type: 'doughnut', data: dataCopy, options: {}});
        if (update && this.chart) {
            this.chart.update();
        }
    }

    public render(): JSX.Element {
        let content;
        if (this.props.data == null) {
            content = (
                <FormattedMessage
                    id='analytics.chart.loading'
                    defaultMessage='Loading...'
                />
            );
        } else {
            content = (
                <canvas
                    ref={this.canvasRef}
                    width={this.props.width}
                    height={this.props.height}
                />
            );
        }

        return (
            <div className='col-sm-6'>
                <div className='total-count'>
                    <div className='title'>
                        {this.props.title}
                    </div>
                    <div className='content'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
