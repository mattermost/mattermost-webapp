// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import crtBetaImg from 'images/crt-beta.gif';

import {closeModal} from 'actions/views/modals';

import GenericModal from 'components/generic_modal';
import AlertBanner from 'components/alert_banner';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {ModalIdentifiers} from 'utils/constants';

import './collapsed_reply_threads_modal.scss';

function CollapsedReplyThreadsModal() {
    const dispatch = useDispatch();

    const onHide = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.COLLAPSED_REPLY_THREADS_MODAL));
    }, []);

    return (
        <GenericModal
            className='CollapsedReplyThreadsModal'
            id={ModalIdentifiers.COLLAPSED_REPLY_THREADS_MODAL}
            enforceFocus={false}
            onHide={onHide}
            handleConfirm={onHide}
            modalHeaderText={(
                <FormattedMessage
                    id='collapsed_reply_threads_modal.title'
                    defaultMessage={'You\'re accessing an early beta of Collapsed Reply Threads'}
                />
            )}
            confirmButtonText={(
                <FormattedMessage
                    id={'collapsed_reply_threads_modal.confirm'}
                    defaultMessage='Got it'
                />
            )}
        >
            <div>
                <AlertBanner
                    variant='app'
                    mode='info'
                    title={(
                        <FormattedMarkdownMessage
                            id='collapsed_reply_threads_modal.banner.title'
                            defaultMessage='Please  [review the list of known issues](!https://docs.mattermost.com/messaging/organizing-conversations.html#known-issues) as we work on stabilizing the feature.'
                        />
                    )}
                    message={(
                        <FormattedMessage
                            id='collapsed_reply_threads_modal.banner.message'
                            defaultMessage='In particular, you may notice a number of channels and threads appear as unread when you enable Collapsed Reply Threads for the first time.'
                        />
                    )}
                />

                <img
                    src={crtBetaImg}
                    className='CollapsedReplyThreadsModal__img'
                />
            </div>
        </GenericModal>
    );
}

export default memo(CollapsedReplyThreadsModal);
