// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import DialogIntroductionText from './dialog_introduction_text.jsx';

describe('components/DialogIntroductionText', () => {
    test('should render message with supported values', () => {
        const descriptor = {
            id: 'testsupported',
            value: '**bold** *italic* [link](https://mattermost.com/) <br/> [link target blank](!https://mattermost.com/)',
        };
        const wrapper = mount(<DialogIntroductionText {...descriptor}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not fail on empty value', () => {
        const descriptor = {
            id: 'testblankvalue',
            value: '',
        };
        const wrapper = mount(<DialogIntroductionText {...descriptor}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
