// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {set} from 'lodash';

import {GlobalState} from 'types/store';

import Avatar from './avatar';

const mockDispatch = jest.fn();
let mockState: GlobalState;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/widgets/users/Avatar', () => {
    beforeEach(() => {
        mockState = {} as GlobalState;
        set(mockState, 'entities.teams.currentTeamId', 'tid');
        set(mockState, 'entities.users.currentUserId', 'uid');
        set(mockState, 'entities.general.config', {});
        set(mockState, 'entities.preferences.myPreferences', {});
    });

    test('should match the snapshot', () => {
        const wrapper = shallow(
            <Avatar
                url='test-url'
                username='test-username'
                size='xl'
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot only with url', () => {
        const wrapper = shallow(
            <Avatar url='test-url'/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot only plain text', () => {
        const wrapper = shallow(
            <Avatar text='SA'/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
