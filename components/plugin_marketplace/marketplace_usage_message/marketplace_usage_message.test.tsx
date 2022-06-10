// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {GlobalState} from 'types/store';

import MarketplaceUsageMessage from './marketplace_usage_message';

const originalMockState = {
    entities: {
        general: {
            config: {
                FeatureFlagCloudFree: 'true',
            },
        },
        cloud: {
            limits: {
                limits: {
                    integrations: {
                        enabled: 5 as number | undefined,
                    },
                },
            },
        },
        usage: {
            integrations: {
                enabled: 0,
            },
        },
        users: {
            currentUserId: 'userid',
        },
        preferences: {
            myPreferences: {
                'usage_limits--hide_marketplace_usage_message': {
                    category: 'usage_limits',
                    name: 'hide_marketplace_usage_message',
                    user_id: 'userid',
                    value: '',
                },
            },
        },
    },
};

let mockState = originalMockState;
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/MarketplaceUsageMessage', () => {
    beforeEach(() => {
        mockState = originalMockState;
    })

    test('below limit, should match snapshot', () => {
        mockState = {
            ...originalMockState,
            entities: {
                ...originalMockState.entities,
                usage: {
                    integrations: {
                        enabled: 0,
                    },
                },
            },
        };

        const wrapper = shallow(
            <MarketplaceUsageMessage/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('reached limit, should match snapshot', () => {
        mockState = {
            ...originalMockState,
            entities: {
                ...originalMockState.entities,
                usage: {
                    integrations: {
                        enabled: 5,
                    },
                },
            },
        };

        const wrapper = shallow(
            <MarketplaceUsageMessage/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('feature flag off, should render null', () => {
        mockState = {
            ...originalMockState,
            entities: {
                ...originalMockState.entities,
                general: {
                    config: {
                        FeatureFlagCloudFree: 'false',
                    },
                }
            },
        };

        const wrapper = shallow(
            <MarketplaceUsageMessage/>,
        );

        expect(wrapper.children()).toHaveLength(0);
    });

    test('no limits set, should render null', () => {
        mockState = {
            ...originalMockState,
            entities: {
                ...originalMockState.entities,
                cloud: {
                    limits: {
                        limits: {
                            integrations: {
                                enabled: undefined,
                            },
                        },
                    },
                },
            },
        };

        const wrapper = shallow(
            <MarketplaceUsageMessage/>,
        );

        expect(wrapper.children()).toHaveLength(0);
    });

    test('preference set and below limit, should render null', () => {
        mockState = {
            ...originalMockState,
            entities: {
                ...originalMockState.entities,
                preferences: {
                    myPreferences: {
                        'usage_limits--hide_marketplace_usage_message': {
                            category: 'usage_limits',
                            name: 'hide_marketplace_usage_message',
                            user_id: 'userid',
                            value: new Date().getTime().toString(),
                        },
                    },
                },
            },
        };

        const wrapper = shallow(
            <MarketplaceUsageMessage/>,
        );

        expect(wrapper.children()).toHaveLength(0);
    });

    test('preference set and reached limit, should render children', () => {
        mockState = {
            ...originalMockState,
            entities: {
                ...originalMockState.entities,
                preferences: {
                    myPreferences: {
                        'usage_limits--hide_marketplace_usage_message': {
                            category: 'usage_limits',
                            name: 'hide_marketplace_usage_message',
                            user_id: 'userid',
                            value: new Date().getTime().toString(),
                        },
                    },
                },
                usage: {
                    integrations: {
                        enabled: 5,
                    },
                },
            },
        };

        const wrapper = shallow(
            <MarketplaceUsageMessage/>,
        );

        expect(wrapper.children()).not.toHaveLength(0);
    });
});
