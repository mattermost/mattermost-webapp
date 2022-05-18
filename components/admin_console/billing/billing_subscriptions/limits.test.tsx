// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {screen} from '@testing-library/react';

import * as redux from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';

import {IntegrationsUsage} from '@mattermost/types/usage';
import {GlobalState} from '@mattermost/types/store';

import {getIntegrationsUsage} from 'mattermost-redux/selectors/entities/usage';

import * as cloudActions from 'actions/cloud';

import {FileSizes} from 'utils/file_utils';

import Limits from './limits';

const limits = {
    integrations: {
        enabled: 5,
    },
    messages: {
        history: 10000,
    },
    files: {
        total_storage: 10 * FileSizes.Gigabyte,
    },
    teams: {
        active: 1,
    },
    boards: {
        cards: 500,
        views: 5,
    },
};

const integrationsUsage: IntegrationsUsage = {
    count: 3,
};

const usageState = {
    entities: {
        usage: {
            integrations: integrationsUsage,
        },
    },
} as GlobalState;

function mockUseSelector(spy: jest.SpyInstance, hasLimits: boolean) {
    // initial render
    spy.mockImplementationOnce(() => hasLimits);
    spy.mockImplementationOnce(() => (hasLimits ? limits : {}));
    spy.mockImplementationOnce(() => hasLimits);
    spy.mockImplementationOnce(() => []);

    // after effect
    spy.mockImplementationOnce(() => hasLimits);
    spy.mockImplementationOnce(() => (hasLimits ? limits : {}));
    spy.mockImplementationOnce(() => hasLimits);
    spy.mockImplementationOnce(() => getIntegrationsUsage(usageState));
}

describe('Limits', () => {
    test('message limit rendered in K', () => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');
        mockUseSelector(spy, true);

        renderWithIntl(<Limits/>);
        screen.getByText('Message History');
        screen.getByText(/of 10K/);
    });

    test('storage limit rendered in GB', () => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');
        mockUseSelector(spy, true);

        renderWithIntl(<Limits/>);
        screen.getByText('File Storage');
        screen.getByText(/of 10GB/);
    });

    test('enabled integration count is shown', () => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');
        mockUseSelector(spy, true);

        renderWithIntl(<Limits/>);
        screen.getByText('Enabled Integrations');
        screen.getByText('3 of 5 integrations (60%)');
    });

    test('requests limits when cloud free feature is enabled', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');
        mockUseSelector(spy, true);

        renderWithIntl(<Limits/>);
        expect(mockGetLimits).toHaveBeenCalled();
    });

    test('does not request limits when cloud free feature is disabled', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');
        mockUseSelector(spy, false);

        renderWithIntl(<Limits/>);
        expect(mockGetLimits).not.toHaveBeenCalled();
    });
});
