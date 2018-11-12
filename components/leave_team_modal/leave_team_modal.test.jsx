// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import LeaveTeamModal from 'components/leave_team_modal/leave_team_modal.jsx';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

describe('components/LeaveTeamModal', () => {
    const requiredProps = {
        currentUserId: 'user_id',
        currentTeamId: 'team_id',
        onHide: jest.fn(),
        show: false,
        isBusy: false,
        actions: {
            removeUserFromTeam: jest.fn(),
            toggleSideBarRightMenu: jest.fn(),
        },

    };

    it('should render the leave team model', () => {
        const wrapper = shallowWithIntl(<LeaveTeamModal {...requiredProps}/>).
            dive({disableLifecycleMethods: true});
        expect(wrapper).toMatchSnapshot();
    });

    it('should call onHide when cancel is clicked', () => {
        const wrapper = shallowWithIntl(<LeaveTeamModal {...requiredProps}/>).
            dive({disableLifecycleMethods: true});
        const cancel = wrapper.find('.btn-default').first();

        cancel.simulate('click');
        expect(requiredProps.onHide).toHaveBeenCalledTimes(1);
    });

    it('should call removeUserFromTeam and toggleSideBarRightMenu when ok is clicked', () => {
        const wrapper = shallowWithIntl(<LeaveTeamModal {...requiredProps}/>).
            dive({disableLifecycleMethods: true});
        const ok = wrapper.find('.btn-danger').first();

        ok.simulate('click');
        expect(requiredProps.actions.removeUserFromTeam).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.toggleSideBarRightMenu).toHaveBeenCalledTimes(1);
        expect(requiredProps.onHide).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.removeUserFromTeam).
            toHaveBeenCalledWith(requiredProps.currentTeamId, requiredProps.currentUserId);
    });

    it('should call attach and remove event listeners', () => {
        document.addEventListener = jest.fn();
        document.removeEventListener = jest.fn();

        const wrapper = shallowWithIntl(<LeaveTeamModal {...{...requiredProps, show: true}}/>).
            dive({disableLifecycleMethods: false});
        const instance = wrapper.instance();

        expect(document.addEventListener).toHaveBeenCalledTimes(1);
        expect(document.removeEventListener).not.toBeCalled();

        instance.componentWillUnmount();

        expect(document.removeEventListener).toHaveBeenCalledTimes(1);
    });
});
