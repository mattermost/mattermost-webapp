// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';

import {useIntl} from 'react-intl';

import {GenericModal} from '@mattermost/components';

import './mark_all_threads_as_read_modal.scss';

function MarkAllThreadsAsReadModal() {
    const {formatMessage} = useIntl();

    return (
        <GenericModal
            className='a11y__modal mark-all-threads-as-read'
            id='mark-all-threads-as-read-modal'
            show={true}
            compassDesign={true}
            modalHeaderText={formatMessage({
                id: 'mark_all_threads_as_read_modal.title',
                defaultMessage: 'Mark all your threads as read?',
            })}
            confirmButtonText={formatMessage({
                id: 'mark_all_threads_as_read_modal.confirm',
                defaultMessage: 'Mark all as read',
            })}
            cancelButtonText={formatMessage({
                id: 'mark_all_threads_as_read_modal.cancel',
                defaultMessage: 'Cancel',
            })}
            handleCancel={() => {}}
            handleConfirm={() => {}}
        >
            <div className='mark_all_threads_as_read_modal__body'>
                <span>
                    { formatMessage({
                        id: 'mark_all_threads_as_read_modal.description',
                        defaultMessage: 'This will clear the unread state and mention badges on all your threads. Are you sure?',
                    })}
                </span>
            </div>
        </GenericModal>
    );
}

export default MarkAllThreadsAsReadModal;
