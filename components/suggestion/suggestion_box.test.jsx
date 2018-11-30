// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';

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
});
