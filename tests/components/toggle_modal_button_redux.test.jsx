// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import {ModalIdentifiers} from 'utils/constants.jsx';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux/toggle_modal_button_redux.jsx';

class TestModal extends React.Component {
    render() {
        return (
            <Modal
                show={true}
            >
                <Modal.Header closeButton={true}/>
                <Modal.Body/>
            </Modal>
        );
    }
}

describe('components/ToggleModalButtonRedux', () => {
    test('component should match snapshot', () => {
        const wrapper = mountWithIntl(
            <ToggleModalButtonRedux
                id='channelDelete'
                role='menuitem'
                modalId={ModalIdentifiers.DELETE_CHANNEL}
                dialogType={TestModal}
                dialogProps={{}}
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
