// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import EditCommand from 'components/integrations/components/edit_command/edit_command.jsx';

describe('components/integrations/EditCommand', () => {
    const emptyFunction = jest.fn();
    const commands = {
        r5tpgt4iepf45jt768jz84djic: {
            id: 'r5tpgt4iepf45jt768jz84djic',
            display_name: 'display_name',
            description: 'description',
            trigger: 'trigger',
            auto_complete: true,
            auto_complete_hint: 'auto_complete_hint',
            auto_complete_desc: 'auto_complete_desc',
            token: 'jb6oyqh95irpbx8fo9zmndkp1r',
            create_at: '1499722850203',
            creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
            delete_at: 0,
            icon_url: 'https://google.com/icon',
            method: 'G',
            team_id: 'm5gix3oye3du8ghk4ko6h9cq7y',
            update_at: 1504468859001,
            url: 'https://google.com/command',
            username: 'username'
        }
    };
    const team = {
        name: 'test',
        id: 'm5gix3oye3du8ghk4ko6h9cq7y'
    };
    global.window.mm_config = {EnableCommands: 'true'};

    test('should match snapshot', () => {
        function getCustomTeamCommands() {
            return Promise.resolve();
        }

        const wrapper = shallow(
            <EditCommand
                team={team}
                commandId={'r5tpgt4iepf45jt768jz84djic'}
                commands={commands}
                editCommandRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{
                    getCustomTeamCommands,
                    editCommand: emptyFunction
                }}
            />,
            {lifecycleExperimental: true}
        );

        return getCustomTeamCommands().then(() => {
            wrapper.update();
            expect(wrapper).toMatchSnapshot();
        });
    });

    test('should match snapshot, loading', () => {
        const wrapper = shallow(
            <EditCommand
                team={team}
                commandId={'r5tpgt4iepf45jt768jz84djic'}
                editCommandRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{
                    getCustomTeamCommands: emptyFunction,
                    editCommand: emptyFunction
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
