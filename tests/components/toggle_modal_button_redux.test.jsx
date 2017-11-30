// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import {ModalIdentifiers} from 'utils/constants.jsx';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux/toggle_modal_button_redux.jsx';
import DeleteChannelModal from 'components/delete_channel_modal';

describe('components/ToggleModalButtonRedux', () => {
    test('component should match snapshot', () => {
        const channel = {
            create_at: 1511983748292,
            creator_id: 'pj9tn4tyupfbbjuoah76575xso',
            delete_at: 0,
            display_name: 'Test',
            extra_update_at: 1511983748307,
            header: '',
            id: 'izpbgcd5e38xpkhgdeqwuijnoh',
            last_post_at: 1511983748333,
            name: 'test',
            purpose: '',
            team_id: 's5c6yy6jo3n57khrqeq85motnr',
            total_msg_count: 0,
            type: 'O',
            update_at: 1511983748292
        };

        const wrapper = mountWithIntl(
            <ToggleModalButtonRedux
                id='channelDelete'
                role='menuitem'
                modalId={ModalIdentifiers.DELETE_CHANNEL}
                dialogType={DeleteChannelModal}
                dialogProps={{channel}}
                actions={{openModal: () => true}}
            >
                <FormattedMessage
                    id='channel_header.delete'
                    defaultMessage='Delete Channel'
                />
            </ToggleModalButtonRedux>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button span').first().html()).toBe('<span>Delete Channel</span>');
    });
});
