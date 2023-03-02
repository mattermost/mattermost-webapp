// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {screen} from '@testing-library/react';

import {Provider} from 'react-redux';

import {DeepPartial} from 'redux';

import mockStore from 'tests/test_store';

import {renderWithIntlAndStore} from 'tests/react_testing_utils';

import {GlobalState} from 'types/store';

import ExternalLink from '.';

describe('components/external_link', () => {
    const initialState: DeepPartial<GlobalState> = {
        entities: {
            general: {
                config: {},
                license: {
                    Cloud: 'true',
                },
            },
            users: {
                currentUserId: 'currentUserId',
            },
        },
    };

    it('should match snapshot', () => {
        const store = mockStore(initialState);
        const wrapper = mount(
            <Provider store={store}>
                <ExternalLink
                    href='https://mattermost.com'

                >{'Click Me'}</ExternalLink>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should not attach parameters if telemetry is disabled', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    config: {
                        DiagnosticsEnabled: 'false',
                    },
                },
            },
        };
        const store: GlobalState = JSON.parse(JSON.stringify(state));
        renderWithIntlAndStore(
            <ExternalLink
                href='https://mattermost.com'
            >{'Click Me'}</ExternalLink>,
            store,
        );

        expect(screen.queryByText('Click Me')).toHaveAttribute('href', 'https://mattermost.com');
    });

    it('should attach parameters if telemetry is enabled', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState?.entities?.general,
                    config: {
                        DiagnosticsEnabled: 'true',
                    },
                },
            },
        };
        const store: GlobalState = JSON.parse(JSON.stringify(state));
        renderWithIntlAndStore(
            <ExternalLink href='https://mattermost.com'>
                {'Click Me'}
            </ExternalLink>,
            store,
        );

        expect(screen.queryByText('Click Me')).toHaveAttribute(
            'href',
            expect.stringContaining(
                'utm_source=mattermost&utm_medium=in-product-cloud&utm_content=&userId=currentUserId&serverId=',
            ),
        );
    });

    it("should not attach parameters if href isn't *.mattermost.com enabled", () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState?.entities?.general,
                    config: {
                        DiagnosticsEnabled: 'true',
                    },
                },
            },
        };
        const store: GlobalState = JSON.parse(JSON.stringify(state));
        renderWithIntlAndStore(
            <ExternalLink href='https://google.com'>
                {'Click Me'}
            </ExternalLink>,
            store,
        );

        expect(screen.queryByText('Click Me')).toHaveAttribute(
            'href',
            expect.not.stringContaining(
                'utm_source=mattermost&utm_medium=in-product-cloud&utm_content=&userId=currentUserId&serverId=',
            ),
        );
    });

    it('should be able to override target, rel', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState?.entities?.general,
                    config: {
                        DiagnosticsEnabled: 'true',
                    },
                },
            },
        };
        const store: GlobalState = JSON.parse(JSON.stringify(state));
        renderWithIntlAndStore(
            <ExternalLink
                target='test'
                rel='test'
                href='https://google.com'
            >{'Click Me'}</ExternalLink>,
            store,
        );

        expect(screen.queryByText('Click Me')).toHaveAttribute(
            'target',
            expect.stringMatching(
                'test',
            ),
        );
        expect(screen.queryByText('Click Me')).toHaveAttribute(
            'rel',
            expect.stringMatching('test'),
        );
    });
});
