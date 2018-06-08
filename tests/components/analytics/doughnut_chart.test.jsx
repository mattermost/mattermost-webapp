// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow, mount} from 'enzyme';

import DoughnutChart from 'components/analytics/doughnut_chart.jsx';

jest.mock('chart.js');

describe('components/analytics/doughnut_chart.jsx', () => {
    test('should match snapshot, on loading', () => {
        const wrapper = shallow(
            <DoughnutChart
                title='Test'
                height={400}
                width={600}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded without data', () => {
        const Chart = require.requireMock('chart.js');
        const data = {};

        const wrapper = mount(
            <DoughnutChart
                title='Test'
                height={400}
                width={600}
                data={data}
            />
        );

        expect(Chart).toBeCalledWith(expect.anything(), {data, options: {}, type: 'doughnut'});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with data', () => {
        const Chart = require.requireMock('chart.js');
        const data = {
            datasets: [
                {data: [1, 2, 3]},
            ],
        };

        const wrapper = mount(
            <DoughnutChart
                title='Test'
                height={400}
                width={600}
                data={data}
            />
        );
        expect(Chart).toBeCalledWith(expect.anything(), {data, options: {}, type: 'doughnut'});
        expect(wrapper).toMatchSnapshot();
    });

    test('should create and destroy the chart on mount and unmount with data', () => {
        const Chart = require.requireMock('chart.js');

        const data = {
            datasets: [
                {data: [1, 2, 3]},
            ],
            labels: ['test1', 'test2', 'test3'],
        };

        const wrapper = mount(
            <DoughnutChart
                title='Test'
                height={400}
                width={600}
                data={data}
            />
        );

        expect(Chart).toBeCalled();
        const chartDestroy = wrapper.instance().chart.destroy;
        wrapper.unmount();
        expect(chartDestroy).toBeCalled();
    });

    test('should update the chart on data change', () => {
        const Chart = require.requireMock('chart.js');

        const oldData = {
            datasets: [
                {data: [1, 2, 3]},
            ],
            labels: ['test1', 'test2', 'test3'],
        };

        const newData = {
            datasets: [
                {data: [1, 2, 3, 4]},
            ],
            labels: ['test1', 'test2', 'test3', 'test4'],
        };

        const wrapper = mount(
            <DoughnutChart
                title='Test'
                height={400}
                width={600}
                data={oldData}
            />
        );

        expect(Chart).toBeCalled();
        expect(wrapper.instance().chart.update).not.toBeCalled();
        wrapper.setProps({title: 'new title'});
        expect(wrapper.instance().chart.update).not.toBeCalled();
        wrapper.setProps({data: newData});
        expect(wrapper.instance().chart.update).toBeCalled();
    });
});
