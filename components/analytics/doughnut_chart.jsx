// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';
import Chart from 'chart.js';

import * as Utils from 'utils/utils.jsx';

export default class DoughnutChart extends React.PureComponent {
    static propTypes = {

        /*
         * Chart title
         */
        title: PropTypes.node,

        /*
         * Chart width
         */
        width: PropTypes.number,

        /*
         * Chart height
         */
        height: PropTypes.number,

        /*
         * Chart data
         */
        data: PropTypes.object,
    };

    chart = null;

    componentDidMount() {
        this.initChart();
    }

    componentDidUpdate(prevProps) {
        if (!Utils.areObjectsEqual(prevProps.data, this.props.data)) {
            this.initChart(true);
        }
    }

    componentWillUnmount() {
        if (this.chart && this.refs.canvas) {
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
        this.chart = new Chart(ctx, {type: 'doughnut', data: dataCopy, options: {}});
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
