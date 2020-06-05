// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ClusterSettings from 'components/admin_console/cluster_settings.jsx';

describe('components/ClusterSettings', () => {
    const baseProps = {
        license: {
            IsLicensed: 'true',
            Cluster: 'true',
        },
    };
    test('should match snapshot, encryption disabled', () => {
        const props = {
            ...baseProps,
            value: [],
        };
        const config = {
            ClusterSettings: {
                Enable: true,
                ClusterName: 'test',
                OverrideHostname: '',
                UseIpAddress: false,
                UseExperimentalGossip: true,
                EnableExperimentalGossipEncryption: false,
                GossipPort: 8074,
                SteamingPort: 8075,
            },
        };
        const wrapper = shallow(
            <ClusterSettings
                {...props}
                config={config}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('#EnableExperimentalGossipEncryption').prop('value')).toBe(false);
    });

    test('should match snapshot, encryption enabled', () => {
        const props = {
            ...baseProps,
            value: [],
        };
        const config = {
            ClusterSettings: {
                Enable: true,
                ClusterName: 'test',
                OverrideHostname: '',
                UseIpAddress: false,
                UseExperimentalGossip: true,
                EnableExperimentalGossipEncryption: true,
                GossipPort: 8074,
                SteamingPort: 8075,
            },
        };
        const wrapper = shallow(
            <ClusterSettings
                {...props}
                config={config}
            />,
        );
        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('#EnableExperimentalGossipEncryption').prop('value')).toBe(true);
    });
});
