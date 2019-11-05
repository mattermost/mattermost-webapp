// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants';

import QuickSwitchModal from 'components/quick_switch_modal/quick_switch_modal.jsx';

describe('components/QuickSwitchModal', () => {
    const baseProps = {
        onHide: jest.fn(),
        showTeamSwitcher: false,
        actions: {
            joinChannelById: jest.fn().mockResolvedValue({data: true}),
            switchToChannel: jest.fn().mockImplementation(() => {
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
            expect(props.actions.switchToChannel).not.toBeCalled();
        });

        it('should fail to switch to a channel', (done) => {
            const wrapper = shallow(
                <QuickSwitchModal {...baseProps}/>
            );

            const channel = {id: 'channel_id', userId: 'user_id', type: Constants.DM_CHANNEL};
            wrapper.instance().handleSubmit({channel});
            expect(baseProps.actions.switchToChannel).toBeCalledWith(channel);
            process.nextTick(() => {
                expect(baseProps.onHide).not.toBeCalled();
                done();
            });
        });

        it('should switch to a channel', (done) => {
            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    switchToChannel: jest.fn().mockImplementation(() => {
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
            expect(props.actions.switchToChannel).toBeCalledWith(channel);
            process.nextTick(() => {
                expect(baseProps.onHide).toBeCalled();
                done();
            });
        });

        it('should join the channel before switching', (done) => {
            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    switchToChannel: jest.fn().mockImplementation(() => {
                        const data = true;
                        return Promise.resolve({data});
                    }),
                },
            };

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            const channel = {id: 'channel_id', name: 'test', type: Constants.OPEN_CHANNEL};
            const selected = {
                type: Constants.MENTION_MORE_CHANNELS,
                channel,
            };
            wrapper.instance().handleSubmit(selected);
            expect(props.actions.joinChannelById).toBeCalledWith(channel.id);
            process.nextTick(() => {
                expect(props.actions.switchToChannel).toBeCalledWith(channel);
                done();
            });
        });

        it('should not join the channel before switching if channel is DM', (done) => {
            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    switchToChannel: jest.fn().mockImplementation(() => {
                        const data = true;
                        return Promise.resolve({data});
                    }),
                },
            };

            const wrapper = shallow(
                <QuickSwitchModal {...props}/>
            );

            const channel = {id: 'channel_id', name: 'test', type: Constants.DM_CHANNEL};
            const selected = {
                type: Constants.MENTION_MORE_CHANNELS,
                channel,
            };
            wrapper.instance().handleSubmit(selected);
            expect(props.actions.joinChannelById).not.toHaveBeenCalled();
            expect(props.actions.switchToChannel).toBeCalledWith(channel);
            process.nextTick(() => {
                expect(baseProps.onHide).toBeCalled();
                done();
            });
        });
    });
});
