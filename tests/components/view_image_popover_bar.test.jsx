import React from 'react';
import {shallow} from 'enzyme';

import ViewImagePopoverBar from 'components/view_image_popover_bar/view_image_popover_bar.jsx';

describe('components/ViewImagePopoverBar', () => {
    test('should match snapshot with public links disabled', () => {
        const wrapper = shallow(
            <ViewImagePopoverBar
                show={true}
                enablePublicLink={false}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with public links enabled', () => {
        const wrapper = shallow(
            <ViewImagePopoverBar
                show={true}
                enablePublicLink={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call publick link callback', () => {
        const mockOnClick = jest.fn();

        const wrapper = shallow(
            <ViewImagePopoverBar
                show={true}
                enablePublicLink={true}
                onGetPublicLink={mockOnClick}
            />
        );

        wrapper.find('a.public-link').first().simulate('click');
        expect(mockOnClick).toHaveBeenCalled();
    });
});
