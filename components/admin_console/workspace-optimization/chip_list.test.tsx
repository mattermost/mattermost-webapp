// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChipsList, {ChipsInfoType} from 'components/admin_console/workspace-optimization/chips_list';

describe('components/admin_console/workspace-optimization/chips_list', () => {
    const overallScoreChipsData: ChipsInfoType = {
        info: 3,
        warning: 2,
        error: 1,
    };

    const baseProps = {
        chipsData: overallScoreChipsData,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ChipsList {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('test chips list lenght is 3 as defined in baseProps', () => {
        const wrapper = shallow(<ChipsList {...baseProps}/>);
        const chips = wrapper.find('Chip');

        expect(chips.length).toBe(3);
    });

    test('test chips list lenght is 2 if one of the properties count is 0', () => {
        const wrapper = shallow(<ChipsList chipsData={{...overallScoreChipsData, error: 0}}/>);
        const chips = wrapper.find('Chip');

        expect(chips.length).toBe(2);
    });
});
