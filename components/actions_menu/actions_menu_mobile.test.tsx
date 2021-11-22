// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import ActionsMenu from 'components/actions_menu/actions_menu';
import {TestHelper} from 'utils/test_helper';

jest.mock('utils/utils', () => {
    return {
        isMobile: jest.fn(() => true),
        localizeMessage: jest.fn(),
    };
});

jest.mock('utils/post_utils', () => {
    const original = jest.requireActual('utils/post_utils');
    return {
        ...original,
        isSystemMessage: jest.fn(() => true),
    };
});

describe('components/actions_menu/ActionsMenu on mobile view', () => {
    test('should match snapshot', () => {
        const baseProps = {
            post: TestHelper.getPostMock({id: 'post_id_1'}),
            components: {},
            teamId: 'team_id_1',
            actions: {
                openModal: jest.fn(),
                doAppCall: jest.fn(),
                postEphemeralCallResponseForPost: jest.fn(),
                fetchBindings: jest.fn(),
            },
            appBindings: [],
            pluginMenuItems: [],
            showTutorialTip: false,
            userId: 'user_id_1',
            appsEnabled: false,
            isSysAdmin: true,
        };

        const wrapper = shallow(
            <ActionsMenu {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
