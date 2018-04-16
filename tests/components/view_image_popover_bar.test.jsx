import React from 'react';
import {shallow} from 'enzyme';

import PopoverBar from 'components/view_image/popover_bar.jsx';

describe('components/view_image/PopoverBar', () => {
    test('should match snapshot with public links disabled', () => {
        const wrapper = shallow(
            <PopoverBar
                show={true}
                enablePublicLink={false}
                canDownloadFiles={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with public links enabled', () => {
        const wrapper = shallow(
            <PopoverBar
                show={true}
                enablePublicLink={true}
                canDownloadFiles={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call publick link callback', () => {
        const mockOnClick = jest.fn();

        const wrapper = shallow(
            <PopoverBar
                show={true}
                enablePublicLink={true}
                canDownloadFiles={true}
                onGetPublicLink={mockOnClick}
            />
        );

        wrapper.find('a.public-link').first().simulate('click');
        expect(mockOnClick).toHaveBeenCalled();
    });
});
