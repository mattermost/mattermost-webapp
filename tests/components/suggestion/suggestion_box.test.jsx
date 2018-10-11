// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

describe('components/SuggestionBox', function() {
    test('findOverlap', () => {
        expect(SuggestionBox.findOverlap('', 'blue')).toBe('');
        expect(SuggestionBox.findOverlap('red', '')).toBe('');
        expect(SuggestionBox.findOverlap('red', 'blue')).toBe('');
        expect(SuggestionBox.findOverlap('red', 'dog')).toBe('d');
        expect(SuggestionBox.findOverlap('red', 'education')).toBe('ed');
        expect(SuggestionBox.findOverlap('red', 'reduce')).toBe('red');
        expect(SuggestionBox.findOverlap('black', 'ack')).toBe('ack');
    });

    it('should avoid ref access on unmount race', (done) => {
        const props = {
            listComponent: SuggestionList,
            value: 'value',
            containerClass: 'test',
            openOnFocus: true,
        };

        const wrapper = mount(
            <SuggestionBox {...props}/>
        );
        wrapper.instance().handleFocusIn({});
        wrapper.unmount();

        setTimeout(done, 100);
    });
});
