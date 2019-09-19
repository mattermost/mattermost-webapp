// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import PopoverBar from 'components/view_image/popover_bar/popover_bar.jsx';

describe('components/view_image/popover_bar/PopoverBar', () => {
    const defaultProps = {
        isDesktopApp: true,
        enablePublicLink: false,
        canDownloadFiles: true,
        isExternalFile: false,
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
            isDesktopApp: true,
        };

        test('when externally hosted', () => {
            const wrapper = shallow(
                <PopoverBar
                    {...props}
                    isExternalFile={true}
                    isDesktopApp={false}
                />
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('when externally hosted and on the desktop app', () => {
            const wrapper = shallow(
                <PopoverBar
                    {...props}
                    isExternalFile={true}
                    isDesktopApp={true}
                />
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('when internally hosted', () => {
            const wrapper = shallow(
                <PopoverBar
                    {...props}
                    isExternalFile={false}
                    isDesktopApp={false}
                />
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('when internally hosted and on the desktop app', () => {
            const wrapper = shallow(
                <PopoverBar
                    {...props}
                    isExternalFile={false}
                    isDesktopApp={true}
                />
            );

            expect(wrapper).toMatchSnapshot();
        });
    });
});
