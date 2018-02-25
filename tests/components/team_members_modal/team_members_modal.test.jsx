// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import TeamMembersModal from 'components/team_members_modal/team_members_modal.jsx';

describe('components/TeamMembersModal', () => {
    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <TeamMembersModal
                currentTeam={{display_name: 'display name'}}
                onHide={emptyFunction}
                onLoad={emptyFunction}
                isAdmin={false}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should set show to false on Modal\'s onHide', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <TeamMembersModal
                currentTeam={{display_name: 'display name'}}
                onHide={emptyFunction}
                onLoad={emptyFunction}
                isAdmin={false}
            />
        );

        wrapper.find(Modal).first().props().onHide();
        expect(wrapper.state('show')).toBe(false);
    });

    test('should call onHide on Modal\'s onExited', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onHide = jest.fn();

        const wrapper = shallow(
            <TeamMembersModal
                currentTeam={{display_name: 'display name'}}
                onHide={onHide}
                onLoad={emptyFunction}
                isAdmin={false}
            />
        );

        wrapper.find(Modal).first().props().onExited();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
