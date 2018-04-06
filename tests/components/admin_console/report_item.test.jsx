// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ReportItem from 'components/admin_console/compliance_reports/report_item/report_item.jsx';

describe('components/ReportItem', () => {
    const baseProps = {
        reports: {
            id: 'someid',
            user_id: 'userid',
            create_at: 123,
            start_at: 1234,
            end_at: 12345,
            emails: [],
            keywords: [],
            type: 'sometype',
            count: 10,
        },
    };

    test('should match snapshot with email', () => {
        const props = {...baseProps, email: 'someemail@somewhere.com'};
        const wrapper = shallow(
            <ReportItem {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with null email', () => {
        const wrapper = shallow(
            <ReportItem {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
