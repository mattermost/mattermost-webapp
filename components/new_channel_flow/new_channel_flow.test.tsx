// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import assert from 'assert';

import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {ChannelType, Channel} from 'mattermost-redux/types/channels';
import * as Utils from 'utils/utils';
import Constants from 'utils/constants';
import NewChannelFlow, {
    SHOW_NEW_CHANNEL,
    SHOW_EDIT_URL,
    SHOW_EDIT_URL_THEN_COMPLETE,
    getChannelTypeFromProps,
    Props,
} from 'components/new_channel_flow/new_channel_flow';

describe('components/NewChannelFlow', () => {
    const baseProps = {
        actions: {
            createChannel: jest.fn(() => {
                const data = {
                    id: 'new-channel-id',
                    name: 'newChannel',
                } as Channel;
                return Promise.resolve({data});
            }),
            switchToChannel: jest.fn(),
            closeModal: jest.fn(),
        },
        channelType: Constants.OPEN_CHANNEL as ChannelType,
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        currentTeamId: 'garbage',
    };

    test('should match snapshot, with base props', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when channelDataChanged is called', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );
        const data = {displayName: 'name', purpose: 'purpose', header: 'header'};
        wrapper.instance().channelDataChanged(data);

        expect(wrapper.state('channelDisplayName')).toEqual(data.displayName);
        expect(wrapper.state('channelPurpose')).toEqual(data.purpose);
        expect(wrapper.state('channelHeader')).toEqual(data.header);
    });

    test('should match state when urlChangeDismissed is called', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );
        wrapper.instance().urlChangeDismissed();

        expect(wrapper.state('flowState')).toEqual(SHOW_NEW_CHANNEL);
    });

    test('should match state when urlChangeSubmitted is called', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );
        const newUrl = 'example.com';
        wrapper.instance().urlChangeSubmitted(newUrl);

        expect(wrapper.state('flowState')).toEqual(SHOW_NEW_CHANNEL);
        expect(wrapper.state('serverError')).toEqual(null);
        expect(wrapper.state('channelName')).toEqual(newUrl);
        expect(wrapper.state('nameModified')).toEqual(true);
    });

    test('should match state when urlChangeRequested is called', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().urlChangeRequested({preventDefault: jest.fn()} as unknown as React.MouseEvent);
        expect(wrapper.state('flowState')).toEqual(SHOW_EDIT_URL);
    });

    test('should match state when typeSwitched is called, with state switched from OPEN_CHANNEL', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.setState({channelType: Constants.OPEN_CHANNEL as ChannelType, serverError: 'server error'});
        wrapper.instance().typeSwitched(Constants.PRIVATE_CHANNEL as ChannelType);
        expect(wrapper.state('channelType')).toEqual(Constants.PRIVATE_CHANNEL);
        expect(wrapper.state('serverError')).toEqual('');

        wrapper.setState({channelType: Constants.PRIVATE_CHANNEL as ChannelType, serverError: 'server error'});
        wrapper.instance().typeSwitched(Constants.OPEN_CHANNEL as ChannelType);
        expect(wrapper.state('channelType')).toEqual(Constants.OPEN_CHANNEL);
        expect(wrapper.state('serverError')).toEqual('');
    });

    test('should match state when typeSwitched is called, with state switched from PRIVATE_CHANNEL', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.setState({channelType: Constants.PRIVATE_CHANNEL as ChannelType});
        wrapper.instance().typeSwitched(Constants.OPEN_CHANNEL as ChannelType);
        expect(wrapper.state('channelType')).toEqual(Constants.OPEN_CHANNEL);
    });

    test('should match state when onModalExited is called', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().typeSwitched(Constants.PRIVATE_CHANNEL as ChannelType);
        expect(wrapper.state('channelType')).toEqual(Constants.PRIVATE_CHANNEL);
    });

    test('should match state when onSubmit is called with invalid channelDisplayName', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().onSubmit();
        expect(wrapper.state('serverError')).toEqual(Utils.localizeMessage('channel_flow.invalidName', 'Invalid Channel Name'));
    });

    test('should call createChannel when onSubmit is called with valid channelDisplayName and valid channelName', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.setState({
            channelDisplayName: 'example',
            channelName: 'example',
        });
        wrapper.instance().onSubmit();
        expect(wrapper.instance().props.actions.createChannel).toHaveBeenCalledTimes(1);
    });

    test('should call createChannel with categoryId when passed', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow
                category={{
                    id: 'c123',
                } as ChannelCategory}
                {...baseProps}
            />,
        );

        wrapper.setState({
            channelDisplayName: 'example',
            channelName: 'example',
        });
        wrapper.instance().onSubmit();
        expect(wrapper.instance().props.actions.createChannel).toHaveBeenCalledWith(expect.anything(), undefined, 'c123');
    });

    test('call closeModal after successfully creating channel', (done) => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().channelDataChanged({
            displayName: 'test',
            header: '',
            purpose: '',
        });
        wrapper.instance().onSubmit();
        expect(wrapper.instance().props.actions.createChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
            expect(wrapper.instance().props.actions.switchToChannel).toHaveBeenCalledTimes(1);
            done();
        });
    });

    test('don\'t call closeModal after failing to create channel', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().channelDataChanged({
            displayName: '',
            header: '',
            purpose: '',
        });
        wrapper.instance().onSubmit();
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(0);

        wrapper.instance().channelDataChanged({
            displayName: 't',
            header: '',
            purpose: '',
        });
        wrapper.instance().onSubmit();

        wrapper.instance().channelDataChanged({
            displayName: 'テスト',
            header: '',
            purpose: '',
        });
        wrapper.instance().onSubmit();
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(0);
    });

    test('show URL modal when trying to submit non-Latin display name', () => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().channelDataChanged({
            displayName: 'テスト',
            header: '',
            purpose: '',
        });
        expect(wrapper.state('channelDisplayName')).toEqual('テスト');
        expect(wrapper.state('channelName')).toEqual('');

        wrapper.instance().onSubmit();
        expect(wrapper.instance().props.actions.createChannel).not.toHaveBeenCalled();
        expect(wrapper.state('flowState')).toEqual(SHOW_EDIT_URL_THEN_COMPLETE);
    });

    test('call closeModal after successfully creating channel from URL modal', (done) => {
        const wrapper = shallow<NewChannelFlow>(
            <NewChannelFlow {...baseProps}/>,
        );

        wrapper.instance().channelDataChanged({
            displayName: 'テスト',
            header: '',
            purpose: '',
        });

        wrapper.instance().onSubmit();
        expect(wrapper.instance().props.actions.createChannel).not.toHaveBeenCalled();
        expect(wrapper.state('flowState')).toEqual(SHOW_EDIT_URL_THEN_COMPLETE);

        wrapper.instance().urlChangeSubmitted('test');
        expect(wrapper.instance().props.actions.createChannel).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
            done();
        });
    });

    test('getChannelTypeFromProps', () => {
        const props: Props = {
            actions: {
                createChannel: jest.fn(),
                switchToChannel: jest.fn(),
                closeModal: jest.fn(),
            },
            category: {} as ChannelCategory,
            currentTeamId: '',
            channelType: Constants.OPEN_CHANNEL as ChannelType,
            canCreatePublicChannel: true,
            canCreatePrivateChannel: true,
        };

        assert.equal(getChannelTypeFromProps(props), Constants.OPEN_CHANNEL);

        props.canCreatePublicChannel = false;
        assert.equal(getChannelTypeFromProps(props), Constants.PRIVATE_CHANNEL);

        props.canCreatePrivateChannel = false;
        assert.equal(getChannelTypeFromProps(props), Constants.OPEN_CHANNEL);

        props.canCreatePublicChannel = true;
        assert.equal(getChannelTypeFromProps(props), Constants.OPEN_CHANNEL);

        props.channelType = Constants.PRIVATE_CHANNEL as ChannelType;
        props.canCreatePrivateChannel = true;
        assert.equal(getChannelTypeFromProps(props), Constants.PRIVATE_CHANNEL);

        props.canCreatePrivateChannel = false;
        assert.equal(getChannelTypeFromProps(props), Constants.OPEN_CHANNEL);

        props.canCreatePublicChannel = true;
        assert.equal(getChannelTypeFromProps(props), Constants.OPEN_CHANNEL);
    });
});
