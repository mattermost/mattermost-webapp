import React from 'react';

import {shallow} from 'enzyme';

import ViewImagePopoverBar from 'components/view_image_popover_bar';

describe('components/ViewImagePopoverBar', () => {
    beforeEach(() => {
        global.window.mm_config = {};
    });

    afterEach(() => {
        global.window.mm_config = {};
    });

    test('should match snapshot', () => {
        /* eslint func-style: "off" */
        const makeWrapper = () => shallow(
            <ViewImagePopoverBar
                show={true}
            />
        );

        expect(makeWrapper()).toMatchSnapshot();

        global.window.mm_config.EnablePublicLink = 'true';
        expect(makeWrapper()).toMatchSnapshot();
    });

    test('should call publick link callback', () => {
        global.window.mm_config.EnablePublicLink = 'true';
        const mockOnClick = jest.fn();

        const wrapper = shallow(
            <ViewImagePopoverBar
                show={true}
                onGetPublicLink={mockOnClick}
            />
        );

        wrapper.find('a.public-link').first().simulate('click');
        expect(mockOnClick).toHaveBeenCalled();
    });
});