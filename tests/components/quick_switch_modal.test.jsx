// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';

import QuickSwitchModal from 'components/quick_switch_modal/quick_switch_modal.jsx';

describe('components/QuickSwitchModal', () => {
    const baseProps = {
        initialMode: 'channel',
        show: true,
        onHide: jest.fn(),
        showTeamSwitcher: false,
        actions: {
            goToChannel: jest.fn(),
            goToChannelById: jest.fn(),
            openDirectChannelToUser: jest.fn(),
        },
    };

    beforeEach(() => {
        baseProps.onHide = jest.fn();
        baseProps.actions.goToChannel = jest.fn();
        baseProps.actions.goToChannelById = jest.fn();
        baseProps.actions.openDirectChannelToUser = jest.fn();
    });

    it('should match snapshot', () => {
        const wrapper = shallow(
            <QuickSwitchModal {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    describe('handleSubmit', () => {
        it('should do nothing if nothing selected', () => {
            const props = {...baseProps};

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            wrapper.instance().handleSubmit();
            expect(baseProps.onHide).not.toBeCalled();
            expect(props.actions.goToChannel).not.toBeCalled();
            expect(props.actions.goToChannelById).not.toBeCalled();
            expect(props.actions.openDirectChannelToUser).not.toBeCalled();
        });

        it('should open direct channel to user when selecting a dm channel', () => {
            const props = {...baseProps};

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            wrapper.instance().handleSubmit({channel: {id: 'channel_id', userId: 'user_id', type: Constants.DM_CHANNEL}});
            expect(baseProps.onHide).not.toBeCalled();
            expect(props.actions.goToChannel).not.toBeCalled();
            expect(props.actions.goToChannelById).not.toBeCalled();
            expect(props.actions.openDirectChannelToUser).toBeCalledWith('user_id', expect.anything(), expect.anything());
        });

        it('should switch to group channel when selecting a group channel', () => {
            const props = {...baseProps};

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            wrapper.instance().handleSubmit({channel: {id: 'channel_id', type: Constants.GM_CHANNEL}});
            expect(baseProps.onHide).toBeCalled();
            expect(props.actions.goToChannel).not.toBeCalled();
            expect(props.actions.goToChannelById).toBeCalledWith('channel_id');
            expect(props.actions.openDirectChannelToUser).not.toBeCalled();
        });

        it('should switch to channel when selecting a private channel', () => {
            const props = {...baseProps};

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            wrapper.instance().handleSubmit({channel: {id: 'channel_id', type: Constants.PRIVATE_CHANNEL}});
            expect(baseProps.onHide).toBeCalled();
            expect(props.actions.goToChannel).toBeCalledWith({id: 'channel_id', type: Constants.PRIVATE_CHANNEL});
            expect(props.actions.goToChannelById).not.toBeCalled();
            expect(props.actions.openDirectChannelToUser).not.toBeCalled();
        });

        it('should switch to channel when selecting an open channel', () => {
            const props = {...baseProps};

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            wrapper.instance().handleSubmit({channel: {id: 'channel_id', type: Constants.OPEN_CHANNEL}});
            expect(baseProps.onHide).toBeCalled();
            expect(props.actions.goToChannel).toBeCalledWith({id: 'channel_id', type: Constants.OPEN_CHANNEL});
            expect(props.actions.goToChannelById).not.toBeCalled();
            expect(props.actions.openDirectChannelToUser).not.toBeCalled();
        });
    });
});
