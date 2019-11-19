// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DotMenu from 'components/dot_menu/dot_menu.jsx';

jest.mock('utils/utils', () => {
    return {
        isMobile: jest.fn(() => true),
        localizeMessage: jest.fn(),
    };
});

jest.mock('utils/post_utils', () => {
    const original = require.requireActual('utils/post_utils');
    return {
        ...original,
        isSystemMessage: jest.fn(() => true),
    };
});

describe('components/dot_menu/DotMenu on mobile view', () => {
    test('should match snapshot', () => {
        const baseProps = {
            post: {id: 'post_id_1'},
            isLicensed: false,
            postEditTimeLimit: '-1',
            enableEmojiPicker: true,
            actions: {
                flagPost: jest.fn(),
                unflagPost: jest.fn(),
                setEditingPost: jest.fn(),
                pinPost: jest.fn(),
                unpinPost: jest.fn(),
                openModal: jest.fn(),
                markPostAsUnread: jest.fn(),
            },
        };

        const wrapper = shallow(
            <DotMenu {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
