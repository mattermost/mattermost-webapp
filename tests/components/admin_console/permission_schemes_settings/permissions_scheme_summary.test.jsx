// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ConfirmModal from 'components/confirm_modal.jsx';
import PermissionsSchemeSummary from 'components/admin_console/permission_schemes_settings/permissions_scheme_summary/permissions_scheme_summary.jsx';

describe('components/admin_console/permission_schemes_settings/permissions_scheme_summary', () => {
    const defaultProps = {
        scheme: {
            id: 'id',
            name: 'Test',
            description: 'Test description',
        },
        teams: [
            {id: 'team-1', name: 'Team 1'},
            {id: 'team-2', name: 'Team 2'},
            {id: 'team-3', name: 'Team 3'},
        ],
        actions: {
            loadSchemeTeams: jest.fn().mockReturnValueOnce(Promise.resolve()),
            deleteScheme: jest.fn(),
        },
    };

    test('should match snapshot on default data', () => {
        const wrapper = shallow(
            <PermissionsSchemeSummary {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on more than eight teams', () => {
        const wrapper = shallow(
            <PermissionsSchemeSummary
                {...defaultProps}
                teams={[
                    {id: 'team-1', name: 'Team 1'},
                    {id: 'team-2', name: 'Team 2'},
                    {id: 'team-3', name: 'Team 3'},
                    {id: 'team-4', name: 'Team 4'},
                    {id: 'team-5', name: 'Team 5'},
                    {id: 'team-6', name: 'Team 6'},
                    {id: 'team-7', name: 'Team 7'},
                    {id: 'team-8', name: 'Team 8'},
                    {id: 'team-9', name: 'Team 9'},
                    {id: 'team-10', name: 'Team 10'},
                ]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on no teams', () => {
        const wrapper = shallow(
            <PermissionsSchemeSummary
                {...defaultProps}
                teams={[]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should ask to toggle on row toggle', () => {
        const deleteScheme = jest.fn();
        const wrapper = shallow(
            <PermissionsSchemeSummary
                {...defaultProps}
                actions={{
                    loadSchemeTeams: jest.fn(),
                    deleteScheme,
                }}
            />
        );
        expect(deleteScheme).not.toBeCalled();
        wrapper.find('.delete-button').first().simulate('click', {stopPropagation: jest.fn()});
        expect(deleteScheme).not.toBeCalled();
        wrapper.find(ConfirmModal).first().prop('onCancel')();
        expect(deleteScheme).not.toBeCalled();

        wrapper.find('.delete-button').first().simulate('click', {stopPropagation: jest.fn()});
        wrapper.find(ConfirmModal).first().prop('onConfirm')();
        expect(deleteScheme).toBeCalledWith('id');
    });
});
