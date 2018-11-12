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
                delete_at: 0,
                scheme_id: '',
                display_name: 'Team 1',
            },
            {
                id: 'id2',
                delete_at: 123,
                scheme_id: '',
                display_name: 'Team 2',
            },
            {
                id: 'id3',
                delete_at: 0,
                scheme_id: 'test',
                display_name: 'Team 3',
            },
            {
                id: 'id4',
                delete_at: 0,
                scheme_id: '',
                display_name: 'Team 4',
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
