// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Root from 'components/root/root';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils';

jest.mock('fastclick', () => ({
    attach: () => {}, // eslint-disable-line no-empty-function
}));

jest.mock('actions/diagnostics_actions', () => ({
    trackLoadTime: () => {}, // eslint-disable-line no-empty-function
}));

jest.mock('actions/global_actions', () => ({
    redirectUserToDefaultTeam: jest.fn(),
}));

jest.mock('utils/utils', () => ({
    localizeMessage: () => {},
    isDevMode: jest.fn(),
    enableDevModeFeatures: jest.fn(),
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

    test('should load config and license on mount and redirect to sign-up page', () => {
        const props = {
            ...baseProps,
            noAccounts: true,
            actions: {
                ...baseProps.actions,
                loadMeAndConfig: jest.fn(async () => [{}, {}, {}]),
            },
            history: {
                push: jest.fn(),
            },
        };

        const wrapper = shallow(<Root {...props}/>);

        expect(props.actions.loadMeAndConfig).toHaveBeenCalledTimes(1);

        wrapper.instance().onConfigLoaded();
        expect(props.history.push).toHaveBeenCalledWith('/signup_user_complete');
    });

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

    test('should load config and enable dev mode features', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                loadMeAndConfig: jest.fn(async () => [{}, {}, {}]),
            },
        };
        Utils.isDevMode.mockReturnValue(true);

        const wrapper = shallow(<Root {...props}/>);

        expect(props.actions.loadMeAndConfig).toHaveBeenCalledTimes(1);

        // Must be invoked in onConfigLoaded
        expect(Utils.isDevMode).not.toHaveBeenCalled();
        expect(Utils.enableDevModeFeatures).not.toHaveBeenCalled();

        wrapper.instance().onConfigLoaded();
        expect(Utils.isDevMode).toHaveBeenCalledTimes(1);
        expect(Utils.enableDevModeFeatures).toHaveBeenCalledTimes(1);
    });

    test('should load config and not enable dev mode features', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                loadMeAndConfig: jest.fn(async () => [{}, {}, {}]),
            },
        };
        Utils.isDevMode.mockReturnValue(false);

        const wrapper = shallow(<Root {...props}/>);

        expect(props.actions.loadMeAndConfig).toHaveBeenCalledTimes(1);

        // Must be invoked in onConfigLoaded
        expect(Utils.isDevMode).not.toHaveBeenCalled();
        expect(Utils.enableDevModeFeatures).not.toHaveBeenCalled();

        wrapper.instance().onConfigLoaded();
        expect(Utils.isDevMode).toHaveBeenCalledTimes(1);
        expect(Utils.enableDevModeFeatures).not.toHaveBeenCalled();
    });

    test('should call history on props change', () => {
        const props = {
            ...baseProps,
            noAccounts: false,

            history: {
                push: jest.fn(),
            },
        };
        const wrapper = shallow(<Root {...props}/>);
        expect(props.history.push).not.toHaveBeenCalled();
        const props2 = {
            noAccounts: true,
        };
        wrapper.setProps(props2);
        expect(props.history.push).toHaveBeenLastCalledWith('/signup_user_complete');
    });
});
