// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';
import DotMenu from 'components/dot_menu/dot_menu.jsx';

jest.mock('utils/utils', () => {
    const original = require.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

jest.mock('utils/post_utils', () => {
    const original = require.requireActual('utils/post_utils');
    return {
        ...original,
        isSystemMessage: jest.fn(() => false),
    };
});

describe('components/dot_menu/DotMenu', () => {
    const baseProps = {
        idPrefix: Constants.CENTER,
        idCount: -1,
        post: {id: 'post_id_1', is_pinned: false},
        isFlagged: false,
        isRHS: false,
        handleCommentClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
            setEditingPost: jest.fn(),
            pinPost: jest.fn(),
            unpinPost: jest.fn(),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot, on Center', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.setState({canEdit: true});
        wrapper.instance().handleEditDisable();
        expect(wrapper.state('canEdit')).toEqual(false);

        expect(wrapper.find('#centerDotMenu2').exists()).toBe(false);
        wrapper.setProps({idCount: 2});
        expect(wrapper.find('#centerDotMenu2').exists()).toBe(false);

        expect(wrapper.find('#rhsrootDotMenu').exists()).toBe(false);
        wrapper.setProps({idPrefix: Constants.RHS_ROOT});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#rhsrootDotMenu').exists()).toBe(true);

        wrapper.setProps({post: {id: 'post_id_1', root_id: 'post_root_id'}});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, canDelete', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        wrapper.setState({canDelete: true});
        expect(wrapper).toMatchSnapshot();
    });
});
