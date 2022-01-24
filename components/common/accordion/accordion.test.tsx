// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Accordion from 'components/common/accordion/accordion';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

describe('/components/common/Accordion', () => {
    const texts = ['First List Item', 'Second List Item', 'Third List Item'];
    const baseProps = {
        onHeaderClick: jest.fn(),
        openMultiple: false,
        accordionItemsData: [
            {
                title: 'First Accordion Item',
                description: 'First accordion Item Description',
                items: [
                    (
                        <p
                            className='accordion-item-content-el'
                            key={1}
                        >
                            {texts[0]}
                        </p>
                    ),
                    (
                        <p
                            className='accordion-item-content-el'
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
                            className='accordion-item-content-el'
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

    test('test accordion opens first accordion item when clicked', () => {
        const wrapper = mountWithIntl(<Accordion {...baseProps}/>);
        const firstAccordionItem = wrapper.find('ul AccordionItem:first-child');
        const header = firstAccordionItem.find('div.accordion-item-header');
        header.simulate('click');

        const firstChildItem = firstAccordionItem.find('div.accordion-item-container p.accordion-item-content-el:first-child');
        const slide1Text = firstChildItem.text();
        expect(slide1Text).toEqual('First List Item');
    });

    test('test accordion opens ONLY one accordion item at a time if NO openMultiple prop is set or set to FALSE', () => {
        const wrapper = mountWithIntl(<Accordion {...baseProps}/>);
        const firstAccordionItem = wrapper.find('ul AccordionItem:first-child');
        const secondAccordionItem = wrapper.find('ul AccordionItem:last-child');

        const header1 = firstAccordionItem.find('div.accordion-item-header');
        const header2 = secondAccordionItem.find('div.accordion-item-header');

        header1.simulate('click');

        // refind the element after making changes so those gets reflected
        const firstAccordionItemAfterEvent = wrapper.find('ul AccordionItem:first-child');
        const secondAccordionItemAfterEvent = wrapper.find('ul AccordionItem:last-child');

        // clicking first list element should only apply the active class to the first one and not to the last
        expect(firstAccordionItemAfterEvent.find('li.accordion-item').hasClass('active')).toEqual(true);
        expect(secondAccordionItemAfterEvent.find('li.accordion-item').hasClass('active')).toEqual(false);

        header2.simulate('click');

        // refind the element after making changes so those gets reflected
        const firstAccordionItemAfterEvent1 = wrapper.find('ul AccordionItem:first-child');
        const secondAccordionItemAfterEvent1 = wrapper.find('ul AccordionItem:last-child');

        // clicking last list element should only apply the active class to the last one and not to the first
        expect(firstAccordionItemAfterEvent1.find('li.accordion-item').hasClass('active')).toEqual(false);
        expect(secondAccordionItemAfterEvent1.find('li.accordion-item').hasClass('active')).toEqual(true);
    });

    test('test accordion opens MORE THAN one accordion item at a time if openMultiple prop IS set to TRUE', () => {
        const wrapper = mountWithIntl(
            <Accordion
                {...baseProps}
                expandMultiple={true}
            />);
        const firstAccordionItem = wrapper.find('ul AccordionItem:first-child');
        const secondAccordionItem = wrapper.find('ul AccordionItem:last-child');

        const header1 = firstAccordionItem.find('div.accordion-item-header');
        const header2 = secondAccordionItem.find('div.accordion-item-header');

        header1.simulate('click');

        // refind the element after making changes so those gets reflected
        const firstAccordionItemAfterEvent = wrapper.find('ul AccordionItem:first-child');
        const secondAccordionItemAfterEvent = wrapper.find('ul AccordionItem:last-child');

        // clicking first list element should only apply the active class to the first one and not to the last
        expect(firstAccordionItemAfterEvent.find('li.accordion-item').hasClass('active')).toEqual(true);
        expect(secondAccordionItemAfterEvent.find('li.accordion-item').hasClass('active')).toEqual(false);

        header2.simulate('click');

        // refind the element after making changes so those gets reflected
        const firstAccordionItemAfterEvent1 = wrapper.find('ul AccordionItem:first-child');
        const secondAccordionItemAfterEvent1 = wrapper.find('ul AccordionItem:last-child');

        // clicking last list element should apply active class to both
        expect(firstAccordionItemAfterEvent1.find('li.accordion-item').hasClass('active')).toEqual(true);
        expect(secondAccordionItemAfterEvent1.find('li.accordion-item').hasClass('active')).toEqual(true);
    });
});
