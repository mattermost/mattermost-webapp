// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LatexBlock from 'components/latex_block/latex_block';

describe('components/LatexBlock', () => {
    const defaultProps = {
        content: '```latex e^{i\\pi} + 1 = 0```',
        enableLatex: true,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<LatexBlock {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('latex is disabled', () => {
        const props = {
            ...defaultProps,
            enableLatex: false,
        };

        const wrapper = shallow(<LatexBlock {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('error in katex', () => {
        const props = {
            content: '```latex e^{i\\pi + 1 = 0```',
            enableLatex: true,
        };

        const wrapper = shallow(<LatexBlock {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
