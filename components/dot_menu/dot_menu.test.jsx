// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

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
        post: {id: 'post_id_1', is_pinned: false},
        location: 'CENTER',
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
    });

    test('should match snapshot, canDelete', () => {
        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        wrapper.setState({canDelete: true});
        expect(wrapper).toMatchSnapshot();
    });
});
