// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Router} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import {renderWithIntl} from 'tests/react_testing_utils';

import ConfirmIntegration from 'components/integrations/confirm_integration/confirm_integration.jsx';

describe('components/integrations/ConfirmIntegration', () => {
    const id = 'r5tpgt4iepf45jt768jz84djic';
    const token = 'jb6oyqh95irpbx8fo9zmndkp1r';
    const getSearchString = (type, identifier = id) => `?type=${type}&id=${identifier}`;

    const location = {
        search: '',
    };
    const team = {
        name: 'team_test',
    };
    const oauthApp = {
        id,
        client_secret: '<==secret==>',
        callback_urls: ['https://someCallback', 'https://anotherCallback'],
    };
    const userId = 'b5tpgt4iepf45jt768jz84djhd';
    const bot = {
        user_id: userId,
        display_name: 'bot',
    };
    const commands = {[id]: {id, token}};
    const oauthApps = {[id]: oauthApp};
    const incomingHooks = {[id]: {id}};
    const outgoingHooks = {[id]: {id, token}};
    const bots = {[userId]: bot};

    const props = {
        team,
        location,
        commands,
        oauthApps,
        incomingHooks,
        outgoingHooks,
        bots,
    };

    test('should match snapshot, oauthApps case', () => {
        props.location.search = getSearchString('oauth2-apps');
        const wrapper = shallow(
            <ConfirmIntegration {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match callback URLs of OAuth Apps', () => {
        props.location.search = getSearchString('oauth2-apps');
        const {container} = renderWithIntl(
            <Router history={browserHistory}>
                <ConfirmIntegration {...props}/>
            </Router>
        );

        expect(container.querySelector('.word-break--all')).toHaveTextContent('URL(s): https://someCallback, https://anotherCallback');
    });

    test('should match snapshot, commands case', () => {
        props.location.search = getSearchString('commands');
        const wrapper = shallow(
            <ConfirmIntegration {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, incomingHooks case', () => {
        props.location.search = getSearchString('incoming_webhooks');
        const wrapper = shallow(
            <ConfirmIntegration {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, outgoingHooks case', () => {
        props.location.search = getSearchString('outgoing_webhooks');
        const wrapper = shallow(
            <ConfirmIntegration {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, outgoingHooks and bad identifier case', () => {
        props.location.search = getSearchString('outgoing_webhooks', 'bad');
        const wrapper = shallow(
            <ConfirmIntegration {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, bad integration type case', () => {
        props.location.search = getSearchString('bad');
        const wrapper = shallow(
            <ConfirmIntegration {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
