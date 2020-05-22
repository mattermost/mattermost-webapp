// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SaveButton from 'components/save_button';
import ElasticSearchSettings from 'components/admin_console/elasticsearch_settings.jsx';

jest.mock('actions/admin_actions.jsx', () => {
    return {
        elasticsearchPurgeIndexes: jest.fn(),
        elasticsearchTest: (config, success) => success(),
    };
});

describe('components/ElasticSearchSettings', () => {
    test('should match snapshot, disabled', () => {
        const config = {
            ElasticsearchSettings: {
                ConnectionUrl: 'test',
                SkipTLSVerification: false,
                Username: 'test',
                Password: 'test',
                Sniff: false,
                EnableIndexing: false,
                EnableSearching: false,
                EnableAutocomplete: false,
            },
        };
        const wrapper = shallow(
            <ElasticSearchSettings
                config={config}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, enabled', () => {
        const config = {
            ElasticsearchSettings: {
                ConnectionUrl: 'test',
                SkipTLSVerification: false,
                Username: 'test',
                Password: 'test',
                Sniff: false,
                EnableIndexing: true,
                EnableSearching: false,
                EnableAutocomplete: false,
            },
        };
        const wrapper = shallow(
            <ElasticSearchSettings
                config={config}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should maintain save disable until is tested', () => {
        const config = {
            ElasticsearchSettings: {
                ConnectionUrl: 'test',
                SkipTLSVerification: false,
                Username: 'test',
                Password: 'test',
                Sniff: false,
                EnableIndexing: false,
                EnableSearching: false,
                EnableAutocomplete: false,
            },
        };
        const wrapper = shallow(
            <ElasticSearchSettings
                config={config}
            />,
        );
        expect(wrapper.find(SaveButton).prop('disabled')).toBe(true);
        wrapper.instance().handleSettingChanged('enableIndexing', true);
        expect(wrapper.find(SaveButton).prop('disabled')).toBe(true);
        const instance = wrapper.instance();
        instance.doSubmit = jest.fn();
        const success = jest.fn();
        instance.doTestConfig(success);
        expect(success).toBeCalled();
        expect(instance.doSubmit).toBeCalled();
        expect(wrapper.find(SaveButton).prop('disabled')).toBe(false);
    });
});
