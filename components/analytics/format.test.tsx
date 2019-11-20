// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {synchronizeChartData} from './format';

describe('components/analytics/format.tsx', () => {
    test('should syncronize chart date ranges', () => {
        const data1 = {
            datasets: [
                {data: [1, 2]}
            ],
            labels: ['date1', 'date2'],
        };
        const data2 = {
            datasets: [],
            labels: [],
        };
        const data3 = {
            datasets: [{data: [3]}],
            labels: ['date1'],
        };
        synchronizeChartData(data1, data2, data3);
        expect(data2.labels.length).toBe(0);
        expect(data3.labels).toEqual(data1.labels);
    });
});
