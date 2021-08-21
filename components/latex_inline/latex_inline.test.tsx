// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LatexInline from 'components/latex_inline/latex_inline';

describe('components/LatexBlock', () => {
    const defaultProps = {
        content: 'e^{i\\pi} + 1 = 0',
        enableInlineLatex: true,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<LatexInline {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('latex is disabled', () => {
        const props = {
            ...defaultProps,
            enableInlineLatex: false,
        };

        const wrapper = shallow(<LatexInline {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('error in katex', () => {
        const props = {
            content: 'e^{i\\pi + 1 = 0',
            enableInlineLatex: true,
        };

        const wrapper = shallow(<LatexInline {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
