// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import PopoverBar from 'components/view_image/popover_bar/popover_bar.jsx';

describe('components/view_image/popover_bar/PopoverBar', () => {
    const defaultProps = {
        enablePublicLink: false,
        canDownloadFiles: true,
        isExternalFile: false,
        showZoomControls: false,
    };

    test('should match snapshot with public links disabled', () => {
        const props = {
            ...defaultProps,
            enablePublicLink: false,
        };

        const wrapper = shallow(<PopoverBar {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with public links enabled', () => {
        const props = {
            ...defaultProps,
            enablePublicLink: true,
        };

        const wrapper = shallow(<PopoverBar {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call public link callback', () => {
        const mockOnClick = jest.fn();
        const props = {
            ...defaultProps,
            enablePublicLink: true,
            onGetPublicLink: mockOnClick,
        };

        const wrapper = shallow(<PopoverBar {...props}/>);
        wrapper.find('a.public-link').first().simulate('click');
        expect(mockOnClick).toHaveBeenCalled();
    });

    describe('should match snapshot for downloadable file', () => {
        const props = {
            ...defaultProps,
            canDownloadFiles: true,
            isExternalFile: false,
            fileUrl: 'http://example.com/img.png',
            filename: 'img.png',
        };

        test('should not add download attribute when externally hosted', () => {
            const wrapper = shallow(
                <PopoverBar
                    {...props}
                    isExternalFile={true}
                />,
            );

            expect(wrapper.find('a').prop('download')).toBeUndefined();
        });

        test('should add download attribute when internally hosted', () => {
            const wrapper = shallow(
                <PopoverBar
                    {...props}
                    isExternalFile={false}
                />,
            );

            expect(wrapper.find('a').prop('download')).toBe(props.filename);
        });
    });

    test('should match snapshot with zoom controls enabled', () => {
        const props = {
            ...defaultProps,
            showZoomControls: true,
        };

        const wrapper = shallow(<PopoverBar {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
