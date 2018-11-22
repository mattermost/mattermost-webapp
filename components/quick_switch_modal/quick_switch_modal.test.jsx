// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';

import QuickSwitchModal from 'components/quick_switch_modal/quick_switch_modal.jsx';

describe('components/QuickSwitchModal', () => {
    const baseProps = {
        onHide: jest.fn(),
        showTeamSwitcher: false,
        actions: {
            switchToChannelById: jest.fn().mockImplementation(() => {
                const error = {
                    message: 'Failed',
                };
                return Promise.resolve({error});
            }),
        },
    };

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
            expect(props.actions.switchToChannelById).not.toBeCalled();
        });

        it('should fail to switch to a channel', (done) => {
            const wrapper = shallow(
                <QuickSwitchModal {...baseProps}/>
            );

            const channel = {id: 'channel_id', userId: 'user_id', type: Constants.DM_CHANNEL};
            wrapper.instance().handleSubmit({channel});
            expect(baseProps.actions.switchToChannelById).toBeCalledWith(channel.id);
            process.nextTick(() => {
                expect(baseProps.onHide).not.toBeCalled();
                done();
            });
        });

        it('should switch to a channel', (done) => {
            const props = {
                ...baseProps,
                actions: {
                    switchToChannelById: jest.fn().mockImplementation(() => {
                        const data = true;
                        return Promise.resolve({data});
                    }),
                },
            };

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            const channel = {id: 'channel_id', userId: 'user_id', type: Constants.DM_CHANNEL};
            wrapper.instance().handleSubmit({channel});
            expect(props.actions.switchToChannelById).toBeCalledWith(channel.id);
            process.nextTick(() => {
                expect(baseProps.onHide).toBeCalled();
                done();
            });
        });
    });
});
