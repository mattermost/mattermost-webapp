// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {Modal} from 'react-bootstrap';

import PDFPreview from 'components/pdf_preview';

import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import './cloud_invoice_preview.scss';

type Props = {
    onHide?: () => void;
    url?: string;
};

function CloudInvoicePreview(props: Props) {
    const dispatch = useDispatch();

    const isPreviewModalOpen = useSelector((state: GlobalState) =>
        isModalOpen(state, ModalIdentifiers.CLOUD_INVOICE_PREVIEW),
    );

    const onHide = () => {
        dispatch(closeModal(ModalIdentifiers.CLOUD_INVOICE_PREVIEW));
        if (typeof props.onHide === 'function') {
            props.onHide();
        }
    };

    return (
        <Modal
            show={isPreviewModalOpen}
            onExited={onHide}
            onHide={onHide}
            id='cloud-invoice-preview'
            className='CloudInvoicePreview'
        >
            <Modal.Header>
                <Modal.Title>{'Invoice'}</Modal.Title>
                <div className={'subtitle'}>
                    {'Download or Print this page for your records'}
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className='cloud_invoice_preview_modal'>
                    <PDFPreview
                        fileInfo={{
                            extension: 'pdf',
                            size: 0,
                            name: 'some-name.pdf',
                        }}
                        fileUrl={
                            'http://localhost:9005/api/v4/files/aphcmr1kjf8qmdqwp6ksqxeier?download=1'
                        }
                        scale={2}
                        handleBgClose={() => {}}
                    />
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default CloudInvoicePreview;
