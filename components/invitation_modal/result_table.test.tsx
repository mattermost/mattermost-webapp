// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';
import {IntlProvider} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import EmailIcon from 'components/widgets/icons/mail_icon';
import AlertIcon from 'components/widgets/icons/alert_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import Avatar from 'components/widgets/users/avatar';

import ResultTable, {Props} from './result_table';

let props: Props = {
    sent: true,
    rows: [],
};
type WithIntlProps = {
    children: React.ReactNode | React.ReactNodeArray;
}

const WithIntl = (props: WithIntlProps) => {
    const translations = {
        'invitation_modal.confirm.not-sent-header': 'not sent',
        'invitation_modal.confirm.sent-header': 'sent',
    };
    return (
        <IntlProvider
            locale={'en'}
            messages={translations}
        >
            {props.children}
        </IntlProvider>
    );
};

const defaultUser = deepFreeze({
    id: 'userid',
    create_at: 1,
    update_at: 1,
    delete_at: 1,
    username: 'username',
    password: 'password',
    auth_data: 'auth_data',
    auth_service: 'auth_service',
    email: 'aa@aa.aa',
    email_verified: true,
    nickname: 'nickname',
    first_name: 'first_name',
    last_name: 'last_name',
    position: 'position',
    roles: 'user',
    allow_marketing: true,
    props: {},
    notify_props: {
        desktop: 'default',
        desktop_sound: 'true',
        email: 'true',
        mark_unread: 'all',
        push: 'default',
        push_status: 'ooo',
        comments: 'never',
        first_name: 'true',
        channel: 'true',
        mention_keys: '',
    },
    last_password_update: 1,
    last_picture_update: 1,
    failed_attempts: 1,
    locale: 'en',
    mfa_active: false,
    mfa_secret: '',
    last_activity_at: 1,
    is_bot: false,
    bot_description: '',
    bot_last_icon_update: 1,
    terms_of_service_id: '',
    terms_of_service_create_at: 1,
},
);

describe('ResultTable', () => {
    beforeEach(() => {
        props = {
            sent: true,
            rows: [],
        };
    });

    test('emails render as email', () => {
        props.rows = [{
            email: 'aa@aa.aa',
            reason: 'some reason',
        }];
        const wrapper = shallow(<ResultTable {...props}/>);
        expect(wrapper.find(EmailIcon).length).toBe(1);
    });

    test('unsent invites render as unsent invites', () => {
        props.rows = [{
            text: '@incomplete_userna',
            reason: 'This was not a complete user',
        }];
        const wrapper = shallow(<ResultTable {...props}/>);
        expect(wrapper.find(AlertIcon).length).toBe(1);
    });

    test('user invites render as users', () => {
        props.rows = [{
            user: defaultUser,
            reason: 'added successfuly',
        }];
        const wrapper = shallow(<ResultTable {...props}/>);
        expect(wrapper.find(Avatar).length).toBe(1);
        expect(wrapper.find(BotBadge).length).toBe(0);
        expect(wrapper.find(GuestBadge).length).toBe(0);
    });

    test('bots render as bots', () => {
        props.rows = [{
            user: {
                ...defaultUser,
                is_bot: true,
            },
            reason: 'added successfuly',
        }];
        const wrapper = shallow(<ResultTable {...props}/>);
        expect(wrapper.find(Avatar).length).toBe(1);
        expect(wrapper.find(BotBadge).length).toBe(1);
        expect(wrapper.find(GuestBadge).length).toBe(0);
    });

    test('guests render as guests', () => {
        props.rows = [{
            user: {
                ...defaultUser,
                roles: 'system_guest',
            },
            reason: 'added successfuly',
        }];
        const wrapper = shallow(<ResultTable {...props}/>);
        expect(wrapper.find(Avatar).length).toBe(1);
        expect(wrapper.find(BotBadge).length).toBe(0);
        expect(wrapper.find(GuestBadge).length).toBe(1);
    });

    test('renders success banner when invites were sent', () => {
        props.sent = true;
        const wrapper = mount(<WithIntl><ResultTable {...props}/></WithIntl>);
        expect(wrapper.find('h2').at(0).text()).toContain('sent');
    });

    test('renders not sent banner when invites were not sent', () => {
        props.sent = false;
        const wrapper = mount(<WithIntl><ResultTable {...props}/></WithIntl>);
        expect(wrapper.find('h2').at(0).text()).toContain('not sent');
    });
});
