// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {screen} from '@testing-library/react';

import * as redux from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';

import * as cloudActions from 'actions/cloud';

import {FileSizes} from 'utils/file_utils';

import Limits from './limits';

const limits = {
    integrations: {
        enabled: 10,
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

describe('Limits', () => {
    test('message limit rendered in K', () => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');

        // initial render
        spy.mockImplementationOnce(() => true);
        spy.mockImplementationOnce(() => limits);

        // after effect
        spy.mockImplementationOnce(() => true);
        spy.mockImplementationOnce(() => limits);
        renderWithIntl(<Limits/>);
        screen.getByText('Message History');
        screen.getByText(/of 10K/);
    });

    test('storage limit rendered in GB', () => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');

        // initial render
        spy.mockImplementationOnce(() => true);
        spy.mockImplementationOnce(() => limits);

        // after effect
        spy.mockImplementationOnce(() => true);
        spy.mockImplementationOnce(() => limits);
        renderWithIntl(<Limits/>);
        screen.getByText('File Storage');
        screen.getByText(/of 10GB/);
    });

    test('requests limits when cloud free feature is enabled', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');

        // initial render
        spy.mockImplementationOnce(() => true);
        spy.mockImplementationOnce(() => limits);

        // after effect
        spy.mockImplementationOnce(() => true);
        spy.mockImplementationOnce(() => limits);
        renderWithIntl(<Limits/>);
        expect(mockGetLimits).toHaveBeenCalled();
    });

    test('does not request limits when cloud free feature is disabled', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const spy = jest.spyOn(redux, 'useSelector');

        // initial render
        spy.mockImplementationOnce(() => false);
        spy.mockImplementationOnce(() => limits);

        // after effect
        spy.mockImplementationOnce(() => false);
        spy.mockImplementationOnce(() => limits);
        renderWithIntl(<Limits/>);
        expect(mockGetLimits).not.toHaveBeenCalled();
    });
});
