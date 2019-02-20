// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import Chart from 'chart.js';

import * as Utils from 'utils/utils.jsx';

export default class LineChart extends React.PureComponent {
    static propTypes = {

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

    chart = null;
    chartOptions = {
        legend: {
            display: false,
        },
    };

    componentDidMount() {
        this.initChart();
    }

    UNSAFE_componentWillUpdate(nextProps) { // eslint-disable-line camelcase
        const willHaveData = nextProps.data && nextProps.data.labels.length > 0;
        const hasChart = Boolean(this.chart);

        if (!willHaveData && hasChart) {
            // Clean up the rendered chart before we render and destroy its context
            this.chart.destroy();
            this.chart = null;
        }
    }

    componentDidUpdate(prevProps) {
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

    componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    initChart = (update) => {
        if (!this.refs.canvas) {
            return;
        }

        var el = ReactDOM.findDOMNode(this.refs.canvas);
        var ctx = el.getContext('2d');
        const dataCopy = JSON.parse(JSON.stringify(this.props.data));
        this.chart = new Chart(ctx, {type: 'line', data: dataCopy, options: this.chartOptions || {}});

        if (update) {
            this.chart.update();
        }
    }

    render() {
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
                    ref='canvas'
                    width={this.props.width}
                    height={this.props.height}
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
