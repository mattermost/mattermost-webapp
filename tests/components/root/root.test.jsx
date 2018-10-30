// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Root from 'components/root/root';
import * as GlobalActions from 'actions/global_actions.jsx';

jest.mock('fastclick', () => ({
    attach: () => {}, // eslint-disable-line no-empty-function
}));

jest.mock('actions/diagnostics_actions', () => ({
    trackLoadTime: () => {}, // eslint-disable-line no-empty-function
}));

jest.mock('actions/global_actions', () => ({
    redirectUserToDefaultTeam: jest.fn(),
}));

describe('components/Root', () => {
    const baseProps = {
        diagnosticsEnabled: true,
        diagnosticId: '1234ab',
        noAccounts: false,
        showTermsOfService: false,
        actions: {
            loadMeAndConfig: async () => [{}, {}, {data: true}], // eslint-disable-line no-empty-function
        },
        location: {
            pathname: '/',
        },
    };

    test('should load user, config, and license on mount and redirect to defaultTeam on success', (done) => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                loadMeAndConfig: jest.fn(baseProps.actions.loadMeAndConfig),
            },
        };

        // Mock the method by extending the class because we don't have a chance to do it before shallow mounts the component
        class MockedRoot extends Root {
            onConfigLoaded = jest.fn(() => {
                expect(this.onConfigLoaded).toHaveBeenCalledTimes(1);
                expect(GlobalActions.redirectUserToDefaultTeam).toHaveBeenCalledTimes(1);
                done();
            });
        }

        shallow(<MockedRoot {...props}/>);

        expect(props.actions.loadMeAndConfig).toHaveBeenCalledTimes(1);
    });

    test('should load user, config, and license on mount and should not redirect to defaultTeam id pathname is not root', (done) => {
        const props = {
            ...baseProps,
            location: {
                pathname: '/admin_console',
            },
        };

        // Mock the method by extending the class because we don't have a chance to do it before shallow mounts the component
        class MockedRoot extends Root {
            onConfigLoaded = jest.fn(() => {
                expect(this.onConfigLoaded).toHaveBeenCalledTimes(1);
                expect(GlobalActions.redirectUserToDefaultTeam).not.toHaveBeenCalled();
                done();
            });
        }

        shallow(<MockedRoot {...props}/>);
    });
});
