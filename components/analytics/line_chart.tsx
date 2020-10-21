// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import Chart, {ChartOptions} from 'chart.js';

import * as Utils from 'utils/utils';

type Props = {
    title: React.ReactNode;
    width: number;
    height: number;
    data?: any;
    id: string;
}

export default class LineChart extends React.PureComponent<Props> {
    private canvasRef = React.createRef<HTMLCanvasElement>()
    public static propTypes = {

        /*
         * Chart title
         */
        title: PropTypes.node.isRequired,

        /*
         * Chart width
         */
        width: PropTypes.number.isRequired,

        /*
         * Chart height
         */
        height: PropTypes.number.isRequired,

        /*
         * Chart data
         */
        data: PropTypes.object,
    };

    public chart: Chart | null = null;
    public chartOptions: ChartOptions = {
        legend: {
            display: false,
        },
    };

    public componentDidMount(): void {
        this.initChart();
    }

    public componentDidUpdate(prevProps: Props): void {
        const currentData = this.props.data && this.props.data.labels.length > 0;

        if (!currentData && this.chart) {
            // Clean up the rendered chart before we render and destroy its context
            this.chart.destroy();
            this.chart = null;
        }

        if (Utils.areObjectsEqual(prevProps.data, this.props.data)) {
            return;
        }

        const hasData = this.props.data && this.props.data.labels.length > 0;
        const hasChart = Boolean(this.chart);

        if (hasData) {
            // Update the rendered chart or initialize it as necessary
            this.initChart(hasChart);
        }
    }

    public componentWillUnmount(): void {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    public initChart = (update?: boolean): void => {
        if (!this.canvasRef.current) {
            return;
        }

        const ctx = this.canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        const dataCopy: any = JSON.parse(JSON.stringify(this.props.data));
        this.chart = new Chart(ctx, {type: 'line', data: dataCopy, options: this.chartOptions || {}});

        if (update) {
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
        } else if (this.props.data.labels.length === 0) {
            content = (
                <h5>
                    <FormattedMessage
                        id='analytics.chart.meaningful'
                        defaultMessage='Not enough data for a meaningful representation.'
                    />
                </h5>
            );
        } else {
            content = (
                <canvas
                    data-testid={this.props.id}
                    ref={this.canvasRef}
                    width={this.props.width}
                    height={this.props.height}
                    data-labels={this.props.data.labels}
                />
            );
        }

        return (
            <div className='col-sm-12'>
                <div className='total-count by-day'>
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
