// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Client4} from 'mattermost-redux/client';

import Root from 'components/root/root';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils';
import Constants, {StoragePrefixes} from 'utils/constants';

jest.mock('fastclick', () => ({
    attach: () => {}, // eslint-disable-line no-empty-function
}));

jest.mock('actions/telemetry_actions', () => ({
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

jest.mock('mattermost-redux/actions/general', () => ({
    setUrl: () => {},
}));
jest.mock('mattermost-redux/client', () => {
    const original = jest.requireActual('mattermost-redux/client');

    return {
        ...original,
        Client4: {
            ...original.Client4,
            setUrl: jest.fn(),
            enableRudderEvents: jest.fn(),
        },
    };
});

describe('components/Root', () => {
    const baseProps = {
        telemetryEnabled: true,
        telemetryId: '1234ab',
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
        wrapper.unmount();
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

        const wrapper = shallow(<MockedRoot {...props}/>);

        expect(props.actions.loadMeAndConfig).toHaveBeenCalledTimes(1);
        wrapper.unmount();
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

        const wrapper = shallow(<MockedRoot {...props}/>);
        wrapper.unmount();
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
        wrapper.unmount();
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
        wrapper.unmount();
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
        wrapper.unmount();
    });

    test('should not call enableRudderEvents on call of onConfigLoaded if url and key for rudder is not set', () => {
        const wrapper = shallow(<Root {...baseProps}/>);
        wrapper.instance().onConfigLoaded();
        expect(Client4.enableRudderEvents).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    test('should call for enableRudderEvents on call of onConfigLoaded if url and key for rudder is set', () => {
        Constants.TELEMETRY_RUDDER_KEY = 'testKey';
        Constants.TELEMETRY_RUDDER_DATAPLANE_URL = 'url';

        const wrapper = shallow(<Root {...baseProps}/>);
        wrapper.instance().onConfigLoaded();
        expect(Client4.enableRudderEvents).toHaveBeenCalled();
        wrapper.unmount();
    });

    test('should reload on focus after getting signal login event from another tab', () => {
        Object.defineProperty(window.location, 'reload', {
            configurable: true,
            writable: true,
        });
        window.location.reload = jest.fn();
        const wrapper = shallow(<Root {...baseProps}/>);
        const loginSignal = new StorageEvent('storage', {
            key: StoragePrefixes.LOGIN,
            newValue: String(Math.random()),
            storageArea: localStorage,
        });

        window.dispatchEvent(loginSignal);
        document.dispatchEvent(new Event('visibilitychange'));
        expect(window.location.reload).toBeCalledTimes(1);
        wrapper.unmount();
    });
});
