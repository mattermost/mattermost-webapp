import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ChannelNotificationsModal from 'components/channel_notifications_modal/channel_notifications_modal.jsx';

describe('components/channel_notifications_modal/ChannelNotificationsModal', () => {
    const channelMember = {
        allow_marketing: true,
        auth_data: '',
        auth_service: '',
        create_at: 1511180034368,
        delete_at: 0,
        email: 'email@email.com',
        first_name: '',
        id: 'xmwtt3ag6jdujcndz17s3szcah',
        last_name: '',
        last_password_update: 1511180034368,
        locale: 'en',
        nickname: '',
        notify_props: {
            channel: 'true',
            desktop: 'all',
            desktop_sound: 'true',
            email: 'true',
            first_name: 'false',
            mention_keys: 'username,@username',
            push: 'mention'
        },
        position: '',
        roles: 'system_admin system_user',
        update_at: 1511206855215,
        username: 'username'
    };

    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        global.window.mm_config = {};

        const wrapper = shallow(
            <ChannelNotificationsModal
                show={true}
                onHide={emptyFunction}
                channel={{name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''}}
                channelMember={channelMember}
                currentUser={{id: 'current_user_id'}}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHide callback when modal is hidden', (done) => {
        function onHide() {
            done();
        }

        const wrapper = mountWithIntl(
            <ChannelNotificationsModal
                show={true}
                onHide={onHide}
                channel={{name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''}}
                channelMember={channelMember}
                currentUser={{id: 'current_user_id'}}
            />
        );

        wrapper.find(Modal).first().props().onExited();
    });
});