// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';
import UserGroupsModal from './user_groups_modal';

describe('component/user_groups_modal', () => {
    const baseProps = {
        onExited: () => {},
        groups: [],
        myGroups: [],
        searchTerm: '',
        currentUserId: '',
        actions: {
            openModal: jest.fn(),
            getGroups: jest.fn(),
            setModalSearchTerm: jest.fn(),
            getGroupsByUserIdPaginated: jest.fn(),
            searchGroups: jest.fn(),
        },
    };

    test('should match snapshot without groups', () => {
        const wrapper = shallow(
            <UserGroupsModal 
                {...baseProps}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});