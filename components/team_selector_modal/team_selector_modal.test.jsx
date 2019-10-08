// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamSelectorModal from 'components/team_selector_modal/team_selector_modal.jsx';

describe('components/TeamSelectorModal', () => {
    const defaultProps = {
        currentSchemeId: 'xxx',
        alreadySelected: ['id1'],
        searchTerm: '',
        teams: [
            {
                id: 'id1',
                label: 'label1',
                delete_at: 0,
                scheme_id: '',
                display_name: 'Team 1',
                value: 'value1',
            },
            {
                id: 'id2',
                label: 'label2',
                delete_at: 123,
                scheme_id: '',
                display_name: 'Team 2',
                value: 'value2',
            },
            {
                id: 'id3',
                label: 'label3',
                delete_at: 0,
                scheme_id: 'test',
                display_name: 'Team 3',
                value: 'value3',
            },
            {
                id: 'id4',
                label: 'label4',
                delete_at: 0,
                scheme_id: '',
                display_name: 'Team 4',
                value: 'value4',
            },
        ],
        onModalDismissed: jest.fn(),
        onTeamsSelected: jest.fn(),
        actions: {
            loadTeams: jest.fn(() => Promise.resolve()),
            setModalSearchTerm: jest.fn(() => Promise.resolve()),
            searchTeams: jest.fn(() => Promise.resolve()),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<TeamSelectorModal {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
