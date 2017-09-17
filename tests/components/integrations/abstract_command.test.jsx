// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AbstractCommand from 'components/integrations/components/abstract_command.jsx';

describe('components/integrations/AbstractCommand', () => {
    const emptyFunction = jest.fn();
    const header = {id: 'Header', defaultMessage: 'Header'};
    const footer = {id: 'Footer', defaultMessage: 'Footer'};
    const command = {
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
    };
    const team = {
        name: 'test',
        id: command.team_id
    };
    const action = jest.genMockFunction().mockImplementation(
        () => {
            return new Promise((resolve) => {
                process.nextTick(() => resolve());
            });
        }
    );

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AbstractCommand
                team={team}
                header={header}
                footer={footer}
                renderExtra={'renderExtra'}
                serverError={'serverError'}
                initialCommand={command}
                action={emptyFunction}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, displays client error', () => {
        const wrapper = shallow(
            <AbstractCommand
                team={team}
                header={header}
                footer={footer}
                renderExtra={'renderExtra'}
                serverError={'serverError'}
                initialCommand={command}
                action={action}
            />
        );

        wrapper.find('#trigger').simulate('change', {target: {value: ''}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).not.toBeCalled();
        expect(wrapper).toMatchSnapshot();
    });

    test('should call action function', () => {
        const wrapper = shallow(
            <AbstractCommand
                team={team}
                header={header}
                footer={footer}
                renderExtra={'renderExtra'}
                serverError={'serverError'}
                initialCommand={command}
                action={action}
            />
        );

        wrapper.find('#displayName').simulate('change', {target: {value: 'name'}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).toBeCalled();
    });
});
