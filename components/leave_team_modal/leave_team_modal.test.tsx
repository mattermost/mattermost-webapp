// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {UserProfile} from 'mattermost-redux/types/users';

import LeaveTeamModal from 'components/leave_team_modal/leave_team_modal';

describe('components/LeaveTeamModal', () => {
    const requiredProps = {
        currentUser: {
            id: 'test',
        } as UserProfile,
        currentUserId: 'user_id',
        currentTeamId: 'team_id',
        publicChannels: [],
        privateChannels: [],
        onHide: jest.fn(),
        show: false,
        isBusy: false,
        actions: {
            leaveTeam: jest.fn(),
            toggleSideBarRightMenu: jest.fn(),
        },

    };

    it('should render the leave team model', () => {
        const wrapper = shallow(<LeaveTeamModal {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should call onHide when cancel is clicked', () => {
        const wrapper = shallow(<LeaveTeamModal {...requiredProps}/>);
        const cancel = wrapper.find('.btn-link').first();

        cancel.simulate('click');
        expect(requiredProps.onHide).toHaveBeenCalledTimes(1);
    });

    it('should call leaveTeam and toggleSideBarRightMenu when ok is clicked', () => {
        const wrapper = shallow(<LeaveTeamModal {...requiredProps}/>);
        const ok = wrapper.find('.btn-danger').first();

        ok.simulate('click');
        expect(requiredProps.actions.leaveTeam).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.toggleSideBarRightMenu).toHaveBeenCalledTimes(1);
        expect(requiredProps.onHide).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.leaveTeam).
            toHaveBeenCalledWith(requiredProps.currentTeamId, requiredProps.currentUserId);
    });

    it('should call attach and remove event listeners', () => {
        document.addEventListener = jest.fn();
        document.removeEventListener = jest.fn();

        const wrapper = shallow(<LeaveTeamModal {...{...requiredProps, show: true}}/>);
        const instance = wrapper.instance() as LeaveTeamModal;

        expect(document.addEventListener).toHaveBeenCalledTimes(1);
        expect(document.removeEventListener).not.toBeCalled();

        instance.componentWillUnmount();

        expect(document.removeEventListener).toHaveBeenCalledTimes(1);
    });
});
