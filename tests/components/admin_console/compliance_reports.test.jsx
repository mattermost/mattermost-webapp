// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ComplianceReports from 'components/admin_console/compliance_reports/compliance_reports.jsx';

describe('components/ComplianceReports', () => {
    const baseProps = {
        isLicensed: true,
        enabled: true,
        reports: [
            {id: 'someid', user_id: 'userid'},
        ],
        actions: {
            getComplianceReports: jest.fn(() => Promise.resolve({})),
            createComplianceReport: jest.fn(() => Promise.resolve({})),
        },
    };

    test('should match snapshot and call actions', () => {
        const wrapper = shallow(
            <ComplianceReports {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(baseProps.actions.getComplianceReports).toHaveBeenCalledTimes(1);
    });
});
