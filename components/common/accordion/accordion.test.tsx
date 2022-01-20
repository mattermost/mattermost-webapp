// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Accordion from 'components/common/accordion/accordion';

// import {mountWithIntl} from 'tests/helpers/intl-test-helper';

describe('/components/common/Accordion', () => {
    const texts = ['First List Item', 'Second List Item', 'Third List Item'];
    const baseProps = {
        onHeaderClick: jest.fn(),
        openMultiple: false,
        items: [
            {
                title: 'First Accordion Item',
                description: 'First accordion Item Description',
                items: [
                    (
                        <p
                            className='accordion-item-content'
                            key={1}
                        >
                            {texts[0]}
                        </p>
                    ),
                    (
                        <p
                            className='accordion-item-content'
                            key={2}
                        >
                            {texts[1]}
                        </p>
                    ),
                ],
            },
            {
                title: 'Second Accordion Item',
                description: 'Second accordion Item Description',
                items: [
                    (
                        <p
                            className='accordion-item-content'
                            key={1}
                        >
                            {texts[2]}
                        </p>
                    ),
                ],
            },
        ],
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<Accordion {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('test accordion items lenght is 2 as specified in items property in baseProps', () => {
        const wrapper = shallow(<Accordion {...baseProps}/>);
        const accordionItems = wrapper.find('AccordionItem');

        expect(accordionItems.length).toBe(2);
    });
});
