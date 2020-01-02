// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import Chart from 'chart.js';

import * as Utils from 'utils/utils.jsx';

type Props = {
    title: React.ReactNode;
    width: number;
    height: number;
    data?: object;
}

export default class DoughnutChart extends React.PureComponent<Props> {
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
        if (this.chart && this.refs.canvas) {
            this.chart.destroy();
        }
    }

    public initChart = (update?: boolean): void => {
        if (!this.refs.canvas) {
            return;
        }
        const el = ReactDOM.findDOMNode(this.refs.canvas) as HTMLCanvasElement;
        const ctx = el.getContext('2d') as CanvasRenderingContext2D;
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
                    ref='canvas'
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
