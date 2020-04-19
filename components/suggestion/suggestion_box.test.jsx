// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';

import AtMentionProvider from 'components/suggestion/at_mention_provider/at_mention_provider.jsx';
import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

jest.mock('utils/user_agent', () => {
    const original = require.requireActual('utils/user_agent');
    return {
        ...original,
        isIos: jest.fn().mockReturnValue(true),
    };
});

describe('components/SuggestionBox', () => {
    const baseProps = {
        listComponent: SuggestionList,
        value: 'value',
        containerClass: 'test',
        openOnFocus: true,
    };

    test('findOverlap', () => {
        expect(SuggestionBox.findOverlap('', 'blue')).toBe('');
        expect(SuggestionBox.findOverlap('red', '')).toBe('');
        expect(SuggestionBox.findOverlap('red', 'blue')).toBe('');
        expect(SuggestionBox.findOverlap('red', 'dog')).toBe('d');
        expect(SuggestionBox.findOverlap('red', 'education')).toBe('ed');
        expect(SuggestionBox.findOverlap('red', 'reduce')).toBe('red');
        expect(SuggestionBox.findOverlap('black', 'ack')).toBe('ack');
    });

    test('should avoid ref access on unmount race', (done) => {
        const wrapper = mount(
            <SuggestionBox {...baseProps}/>
        );
        wrapper.instance().handleFocusIn({});
        wrapper.unmount();
        done();
    });

    test('should match state and/or call function on handleFocusOut', () => {
        const onBlur = jest.fn();
        const wrapper = shallow(
            <SuggestionBox
                {...baseProps}
                onBlur={onBlur}
            />
        );
        wrapper.setState({focused: true});
        const instance = wrapper.instance();
        const contains = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const relatedTarget = jest.fn();
        instance.container = {contains};
        instance.handleEmitClearSuggestions = jest.fn();

        instance.handleFocusOut({relatedTarget});
        expect(instance.handleEmitClearSuggestions).not.toBeCalled();
        expect(wrapper.state('focused')).toEqual(true);
        expect(onBlur).not.toBeCalled();

        // test for iOS agent
        instance.handleFocusOut({});
        expect(instance.handleEmitClearSuggestions).not.toBeCalled();
        expect(wrapper.state('focused')).toEqual(true);
        expect(onBlur).not.toBeCalled();

        instance.handleFocusOut({relatedTarget});
        expect(instance.handleEmitClearSuggestions).toBeCalledTimes(1);
        expect(wrapper.state('focused')).toEqual(false);
        expect(onBlur).toBeCalledTimes(1);
    });

    test('should force pretext change on context change', () => {
        const wrapper = shallow(
            <SuggestionBox
                {...baseProps}
            />
        );
        const instance = wrapper.instance();
        instance.handlePretextChanged = jest.fn();
        instance.getTextbox = jest.fn().mockReturnValue({value: 'value'});

        wrapper.setProps({...baseProps});
        expect(instance.handlePretextChanged).not.toBeCalled();

        wrapper.setProps({...baseProps, contextId: 'new'});
        expect(instance.handlePretextChanged).toBeCalledWith('value');

        wrapper.setProps({...baseProps, contextId: 'new'});
        expect(instance.handlePretextChanged.mock.calls.length).toBe(1);
    });

    test('should force pretext change after text has been cleared by parent', async () => {
        const wrapper = shallow(
            <SuggestionBox
                {...baseProps}
            />
        );
        const instance = wrapper.instance();
        instance.handlePretextChanged = jest.fn();
        instance.pretext = 'value';

        wrapper.setProps({...baseProps});
        expect(instance.handlePretextChanged).not.toBeCalled();

        wrapper.setProps({...baseProps, value: ''});
        expect(instance.handlePretextChanged).toBeCalledWith('');
    });

    test('should force pretext change on composition update', () => {
        const wrapper = shallow(
            <SuggestionBox
                {...baseProps}
            />
        );
        const instance = wrapper.instance();
        instance.handlePretextChanged = jest.fn();
        instance.getTextbox = jest.fn().mockReturnValue({value: ''});

        instance.handleCompositionUpdate({data: '@ㅈ'});
        expect(instance.handlePretextChanged).toBeCalledWith('@ㅈ');

        instance.handleCompositionUpdate({data: '@저'});
        expect(instance.handlePretextChanged).toBeCalledWith('@저');
    });

    test('should reset selection after provider.handlePretextChanged is handled', () => {
        const userid1 = {id: 'userid1', username: 'user', first_name: 'a', last_name: 'b', nickname: 'c'};
        const userid2 = {id: 'userid2', username: 'user2', first_name: 'd', last_name: 'e', nickname: 'f'};
        const userid3 = {id: 'userid3', username: 'other', first_name: 'X', last_name: 'Y', nickname: 'Z'};

        const baseParams = {
            currentUserId: 'userid1',
            profilesInChannel: [userid1, userid2, userid3],
            autocompleteUsersInChannel: jest.fn().mockResolvedValue(false),
        };
        const provider = new AtMentionProvider(baseParams);
        const props = {
            ...baseProps,
            providers: [provider],
        };
        const wrapper = shallow(
            <SuggestionBox
                {...props}
            />
        );
        const instance = wrapper.instance();

        expect(wrapper.state('selection')).toEqual('');

        instance.nonDebouncedPretextChanged('hello world @');
        expect(wrapper.state('selection')).toEqual('@other');

        instance.nonDebouncedPretextChanged('hello world @u');
        expect(wrapper.state('selection')).toEqual('@user');

        instance.nonDebouncedPretextChanged('hello world @');
        expect(wrapper.state('selection')).toEqual('@user');

        instance.nonDebouncedPretextChanged('hello world ');
        expect(wrapper.state('selection')).toEqual('');
    });

    test('should call setState for clear based on present cleared state', () => {
        const wrapper = mount(
            <SuggestionBox {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.setState = jest.fn();
        instance.clear();
        expect(instance.setState).not.toHaveBeenCalled();
        wrapper.setState({cleared: false});
        wrapper.update();
        instance.clear();
        expect(instance.setState).toHaveBeenCalled();
    });
});
