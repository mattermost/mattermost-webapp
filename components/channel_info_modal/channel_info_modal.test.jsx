// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ChannelInfoModal from 'components/channel_info_modal/channel_info_modal.jsx';

describe('components/ChannelInfoModal', () => {
    it('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ChannelInfoModal
                channel={{name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''}}
                currentTeam={{id: 'testid', name: 'testteam'}}
                onHide={emptyFunction}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with channel props', () => {
        const channel = {
            name: 'testchannel',
            displayName: 'testchannel',
            header: 'See ~test',
            purpose: 'And ~test too',
            props: {
                channel_mentions: {
                    test: {
                        display_name: 'Test',
                    },
                },
            },
        };
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ChannelInfoModal
                channel={channel}
                currentTeam={{id: 'testid', name: 'testteam'}}
                onHide={emptyFunction}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    // Something about this test requires is to be run last, otherwise the suite will hang.
    it('should call onHide callback when modal is hidden', (done) => {
        function onHide() {
            done();
        }

        const wrapper = mountWithIntl(
            <ChannelInfoModal
                channel={{name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''}}
                currentTeam={{id: 'testid', name: 'testteam'}}
                onHide={onHide}
            />
        );

        wrapper.find(Modal).first().props().onExited();
        done();
    });
});
