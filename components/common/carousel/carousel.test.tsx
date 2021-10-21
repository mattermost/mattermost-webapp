// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Carousel from 'components/common/carousel/carousel';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';

describe('/components/common/Carousel', () => {
    const texts = ['First Slide', 'Second Slide', 'Third Slide'];
    const baseProps = {
        id: 'test-string',
        infiniteSlide: true,
        dataSlides: [
            (
                <p
                    className='slide'
                    key={1}
                >
                    {texts[0]}
                </p>),
            (
                <p
                    className='slide'
                    key={2}
                >
                    {texts[1]}
                </p>
            ),
            (
                <p
                    className='slide'
                    key={3}
                >
                    {texts[2]}
                </p>
            ),
        ],
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<Carousel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('test carouse slides lenght is as expected', () => {
        const wrapper = shallow(<Carousel {...baseProps}/>);
        const slides = wrapper.find('p.slide');

        expect(slides.length).toBe(3);
    });

    test('test carousel shows next and previous button', () => {
        const wrapper = mountWithIntl(<Carousel {...baseProps}/>);
        const buttonNext = wrapper.find('CarouselButton').find('a.next');
        const buttonPrev = wrapper.find('CarouselButton').find('a.prev');

        expect(buttonNext).toHaveLength(1);
        expect(buttonPrev).toHaveLength(1);
    });

    test('test carousel shows first slide as active', () => {
        const wrapper = shallow(<Carousel {...baseProps}/>);
        const activeSlide = wrapper.find('div.active-anim');

        const slideText = activeSlide.find('p.slide').text();
        expect(slideText).toEqual('First Slide');
    });

    test('test carousel moves slides when clicking buttons', (done) => {
        const wrapper = mountWithIntl(<Carousel {...baseProps}/>);
        const activeSlide = wrapper.find('div.active-anim');

        const slide1Text = activeSlide.find('p.slide').text();
        expect(slide1Text).toEqual('First Slide');

        const buttonNext = wrapper.find('CarouselButton').find('a.next');

        buttonNext.simulate('click');

        jest.useFakeTimers();
        setTimeout(() => {
            const activeSlide = wrapper.find('div.active-anim');
            const slide1Text = activeSlide.find('p.slide').text();
            expect(slide1Text).toEqual('Second Slide');
            done();
        }, 1000);
        jest.runAllTimers();
    });

    test('test carousel executes custom next and prev btn callback functions', () => {
        const customPrevSlideFn = jest.fn();
        const customNextSlideFn = jest.fn();
        const props = {
            ...baseProps,
            customPrevSlideFn,
            customNextSlideFn};

        const wrapper = mountWithIntl(<Carousel {...props}/>);
        const buttonNext = wrapper.find('CarouselButton').find('a.next');
        const buttonPrev = wrapper.find('CarouselButton').find('a.prev');

        buttonNext.simulate('click');
        buttonPrev.simulate('click');

        expect(customNextSlideFn).toHaveBeenCalled();
        expect(customPrevSlideFn).toHaveBeenCalled();
    });
});
