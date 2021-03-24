// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CommercialSupportModal from 'components/commercial_support_modal/commercial_support_modal';

describe('components/CommercialSupportModal', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <CommercialSupportModal
                show={true}
                onHide={jest.fn()}
                showBannerWarning={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
