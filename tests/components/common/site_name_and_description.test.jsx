// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';

import SiteNameAndDescription from 'components/common/site_name_and_description.jsx';

describe('/components/common/SiteNameAndDescription', () => {
    const baseProps = {
        customDescriptionText: '',
        isLicensed: false,
        siteName: 'Mattermost',
    };

    test('should match snapshot, default', () => {
        const wrapper = shallow(<SiteNameAndDescription {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('h1').text()).toEqual(baseProps.siteName);
        expect(wrapper.find(FormattedMessage).exists()).toBe(true);
    });

    test('should match snapshot, with custom site name and description', () => {
        const props = {...baseProps, customDescriptionText: 'custom_description_text', siteName: 'other_site'};
        const wrapper = shallow(<SiteNameAndDescription {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('h1').text()).toEqual(props.siteName);
        expect(wrapper.find('h4').text()).not.toEqual(props.customDescriptionText);

        wrapper.setProps({isLicensed: true});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('h1').text()).toEqual(props.siteName);
        expect(wrapper.find('h4').text()).toEqual(props.customDescriptionText);
    });
});
