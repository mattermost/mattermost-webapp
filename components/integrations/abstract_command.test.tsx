// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';

import AbstractCommand from 'components/integrations/abstract_command';
import test_helper from 'packages/mattermost-redux/test/test_helper';
import {TeamType} from 'packages/mattermost-redux/src/types/teams';

describe('components/integrations/AbstractCommand', () => {
    const header = {id: 'Header', defaultMessage: 'Header'};
    const footer = {id: 'Footer', defaultMessage: 'Footer'};
    const loading = {id: 'Loading', defaultMessage: 'Loading'};
    const command = {
        id: 'r5tpgt4iepf45jt768jz84djic',
        display_name: 'display_name',
        description: 'description',
        trigger: 'trigger',
        auto_complete: true,
        auto_complete_hint: 'auto_complete_hint',
        auto_complete_desc: 'auto_complete_desc',
        token: 'jb6oyqh95irpbx8fo9zmndkp1r',
        create_at: 1499722850203,
        creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
        delete_at: 0,
        icon_url: 'https://google.com/icon',
        method: 'G' as ('P' | 'G' | ''),
        team_id: 'm5gix3oye3du8ghk4ko6h9cq7y',
        update_at: 1504468859001,
        url: 'https://google.com/command',
        username: 'username',
    };
    const fakeTeam = test_helper.fakeTeamWithId();
    const team = {
        ...fakeTeam,
        name: 'm5gix3oye3du8ghk4ko6h9cq7y',
        description: command.description,
        type: 'O' as TeamType,
        company_name: 'Company Name',
        allow_open_invite: false,
        group_constrained: false,
    };
    const action = jest.fn().mockImplementation(
        () => {
            return new Promise<void>((resolve) => {
                process.nextTick(() => resolve());
            });
        },
    );

    const baseProps = {
        team,
        header,
        footer,
        loading,
        renderExtra: 'renderExtra',
        serverError: '',
        initialCommand: command,
        action,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AbstractCommand {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, displays client error', () => {
        const newSeverError = 'server error';
        const props = {...baseProps, serverError: newSeverError};
        const wrapper = shallow(
            <AbstractCommand {...props}/>,
        );

        wrapper.find('#trigger').simulate('change', {target: {value: ''}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault: jest.fn()});

        expect(wrapper).toMatchSnapshot();
        expect(action).not.toBeCalled();
    });

    test('should call action function', () => {
        const wrapper = shallow(
            <AbstractCommand {...baseProps}/>,
        );

        wrapper.find('#displayName').simulate('change', {target: {value: 'name'}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault: jest.fn()});

        expect(action).toBeCalled();
    });

    test('should match object returned by getStateFromCommand', () => {
        const wrapper = shallow<typeof AbstractCommand>(
            <AbstractCommand {...baseProps}/>,
        );

        const expectedOutput = {
            autocomplete: true,
            autocompleteDescription: 'auto_complete_desc',
            autocompleteHint: 'auto_complete_hint',
            clientError: null,
            description: 'description',
            displayName: 'display_name',
            iconUrl: 'https://google.com/icon',
            method: 'G',
            saving: false,
            trigger: 'trigger',
            url: 'https://google.com/command',
            username: 'username',
            create_at: 1499722850203,
            creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
            delete_at: 0,
            id: 'r5tpgt4iepf45jt768jz84djic',
            token: 'jb6oyqh95irpbx8fo9zmndkp1r',
            update_at: 1504468859001,
        };

        const instance = wrapper.instance() as any as InstanceType<typeof AbstractCommand>;
        expect(instance.getStateFromCommand(command)).toEqual(expectedOutput);
    });

    test('should match state when method is called', () => {
        const wrapper = shallow(
            <AbstractCommand {...baseProps}/>,
        );
        const instance = wrapper.instance() as any as InstanceType<typeof AbstractCommand>;

        const displayName = 'new display_name';
        instance.updateDisplayName({target: {value: displayName}});
        expect(wrapper.state('displayName')).toEqual(displayName);

        const description = 'new description';
        instance.updateDescription({target: {value: description}});
        expect(wrapper.state('description')).toEqual(description);

        const trigger = 'new trigger';
        instance.updateTrigger({target: {value: trigger}});
        expect(wrapper.state('trigger')).toEqual(trigger);

        const url = 'new url';
        instance.updateUrl({target: {value: url}});
        expect(wrapper.state('url')).toEqual(url);

        const method = 'new method';
        instance.updateMethod({target: {value: method}});
        expect(wrapper.state('method')).toEqual(method);

        const username = 'new username';
        instance.updateUsername({target: {value: username}});
        expect(wrapper.state('username')).toEqual(username);

        const iconUrl = 'new iconUrl';
        instance.updateIconUrl({target: {value: iconUrl}});
        expect(wrapper.state('iconUrl')).toEqual(iconUrl);

        instance.updateAutocomplete({target: {checked: true}});
        expect(wrapper.state('autocomplete')).toEqual(true);
        instance.updateAutocomplete({target: {checked: false}});
        expect(wrapper.state('autocomplete')).toEqual(false);

        const autocompleteHint = 'new autocompleteHint';
        instance.updateAutocompleteHint({target: {value: autocompleteHint}});
        expect(wrapper.state('autocompleteHint')).toEqual(autocompleteHint);

        const autocompleteDescription = 'new autocompleteDescription';
        instance.updateAutocompleteDescription({target: {value: autocompleteDescription}});
        expect(wrapper.state('autocompleteDescription')).toEqual(autocompleteDescription);
    });

    test('should match state when handleSubmit is called', () => {
        const newAction = jest.fn().mockImplementation(
            () => {
                return new Promise<void>((resolve) => {
                    process.nextTick(() => resolve());
                });
            },
        );
        const props = {...baseProps, action: newAction};
        const wrapper = shallow(
            <AbstractCommand {...props}/>,
        );
        expect(newAction).toHaveBeenCalledTimes(0);

        const evt = {preventDefault: jest.fn()};
        const instance = wrapper.instance() as any as InstanceType<typeof AbstractCommand>;

        const handleSubmit = instance.handleSubmit;
        handleSubmit(evt);
        expect(wrapper.state('saving')).toEqual(true);
        expect(wrapper.state('clientError')).toEqual('');
        expect(newAction).toHaveBeenCalledTimes(1);

        // saving is true
        wrapper.setState({saving: true});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual('');
        expect(newAction).toHaveBeenCalledTimes(1);

        // empty trigger
        wrapper.setState({saving: false, trigger: ''});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual(
            <FormattedMessage
                defaultMessage='A trigger word is required'
                id='add_command.triggerRequired'
            />,
        );
        expect(newAction).toHaveBeenCalledTimes(1);

        // trigger that starts with a slash '/'
        wrapper.setState({saving: false, trigger: '//startwithslash'});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual(
            <FormattedMessage
                defaultMessage='A trigger word cannot begin with a /'
                id='add_command.triggerInvalidSlash'
            />,
        );
        expect(newAction).toHaveBeenCalledTimes(1);

        // trigger with space
        wrapper.setState({saving: false, trigger: '/trigger with space'});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual(
            <FormattedMessage
                defaultMessage='A trigger word must not contain spaces'
                id='add_command.triggerInvalidSpace'
            />,
        );
        expect(newAction).toHaveBeenCalledTimes(1);

        // trigger above maximum length
        wrapper.setState({saving: false, trigger: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual(
            <FormattedMessage
                defaultMessage='A trigger word must contain between {min} and {max} characters'
                id='add_command.triggerInvalidLength'
                values={{max: 128, min: 1}}
            />,
        );
        expect(newAction).toHaveBeenCalledTimes(1);

        // good triggers
        wrapper.setState({saving: false, trigger: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678'});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual('');
        expect(newAction).toHaveBeenCalledTimes(2);

        wrapper.setState({saving: false, trigger: '/trigger'});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual('');
        expect(newAction).toHaveBeenCalledTimes(3);

        wrapper.setState({saving: false, trigger: 'trigger'});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual('');
        expect(newAction).toHaveBeenCalledTimes(4);

        // empty url
        wrapper.setState({saving: false, trigger: 'trigger', url: ''});
        handleSubmit(evt);
        expect(wrapper.state('clientError')).toEqual(
            <FormattedMessage
                defaultMessage='A request URL is required'
                id='add_command.urlRequired'
            />,
        );
        expect(newAction).toHaveBeenCalledTimes(4);
    });
});
