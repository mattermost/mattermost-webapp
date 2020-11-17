// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {mount} from 'enzyme';

import ModalController from 'components/modal_controller';

class TestModal extends React.PureComponent {
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

describe('components/ModalController', () => {
    const mockStore = configureStore();

    test('component should match snapshot without any modals', () => {
        const state = {
            views: {
                modals: {
                    modalState: {},
                },
            },
        };

        const store = mockStore(state);

        const wrapper = mount(
            <Provider store={store}>
                <ModalController/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('div').first().html()).toBe('<div></div>');
        expect(document.getElementsByClassName('modal-dialog').length).toBeFalsy();
    });

    test('test model should be open', () => {
        const state = {
            views: {
                modals: {
                    modalState: {
                        test_modal: {
                            open: true,
                            dialogProps: {},
                            dialogType: TestModal,
                        },
                    },
                },
            },
        };

        const store = mockStore(state);

        mount(
            <Provider store={store}>
                <ModalController/>
            </Provider>,
        );

        expect(document.getElementsByClassName('modal-dialog').length).toBe(1);
    });
});
