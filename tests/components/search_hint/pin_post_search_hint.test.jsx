// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PinPostSearchHint from 'components/search_hint/pin_post_search_hint';

describe('components/PinPostSearchHint', () => {
    test('should match snapshot, with data retention', () => {
        const wrapper = shallow(
            <PinPostSearchHint
                dataRetentionEnableMessageDeletion={true}
                dataRetentionMessageRetentionDays={'30'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without data retention', () => {
        const wrapper = shallow(
            <PinPostSearchHint/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
