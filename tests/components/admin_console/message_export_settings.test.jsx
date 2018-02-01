// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MessageExportSettings from 'components/admin_console/message_export_settings.jsx';

describe('components/MessageExportSettings', () => {
    test('should match snapshot, disabled', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        var config = {
            MessageExportSettings: {
                EnableExport: false,
                ExportFormat: "actiance",
                DailyRunTime: "01:00",
                ExportFromTimestamp: null,
                BatchSize: 10000
            }
        }

        const wrapper = shallow(
            <MessageExportSettings
                config={config}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enabled, actiance', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        var config = {
            MessageExportSettings: {
                EnableExport: true,
                ExportFormat: "actiance",
                DailyRunTime: "01:00",
                ExportFromTimestamp: 12345678,
                BatchSize: 10000
            }
        }

        const wrapper = shallow(
            <MessageExportSettings
                config={config}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enabled, globalrelay', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        var config = {
            MessageExportSettings: {
                EnableExport: true,
                ExportFormat: "globalrelay",
                DailyRunTime: "01:00",
                ExportFromTimestamp: 12345678,
                BatchSize: 10000,
                GlobalRelayEmailAddress: "test@mattermost.com"
            }
        }

        const wrapper = shallow(
            <MessageExportSettings
                config={config}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
