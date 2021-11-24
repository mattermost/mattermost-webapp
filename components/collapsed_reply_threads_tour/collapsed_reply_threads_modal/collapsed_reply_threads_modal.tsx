// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import crtBetaImg from 'images/crt-beta.gif';

import {closeModal} from 'actions/views/modals';

import GenericModal from 'components/generic_modal';
import {Constants, ModalIdentifiers, Preferences} from 'utils/constants';

import './collapsed_reply_threads_modal.scss';
import NextIcon from '../../widgets/icons/fa_next_icon';
import FormattedMarkdownMessage from '../../formatted_markdown_message';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import * as Utils from 'utils/utils';
type Props = {
    onExited: () => void;
}
function CollapsedReplyThreadsModal(props: Props) {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            onNext();
        }
    }, []);
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const onHide = useCallback((skipTour: boolean) => {
        dispatch(closeModal(ModalIdentifiers.COLLAPSED_REPLY_THREADS_MODAL));
        if (skipTour) {
            const preferences = [{
                user_id: currentUserId,
                category: Preferences.CRT_TUTORIAL_TRIGGERED,
                name: currentUserId,
                value: (Constants.CrtTutorialTriggerSteps.FINISHED).toString(),
            }];
            dispatch(savePreferences(currentUserId, preferences));
        }
    }, []);

    const onNext = useCallback(() => {
        const preferences = [{
            user_id: currentUserId,
            category: Preferences.CRT_TUTORIAL_TRIGGERED,
            name: currentUserId,
            value: (Constants.CrtTutorialTriggerSteps.STARTED).toString(),
        }];
        dispatch(savePreferences(currentUserId, preferences));
        onHide(false);
    }, []);

    return (
        <GenericModal
            className='CollapsedReplyThreadsModal productNotices'
            id={ModalIdentifiers.COLLAPSED_REPLY_THREADS_MODAL}
            enforceFocus={false}
            onExited={props.onExited}
            handleConfirm={onNext}
            autoCloseOnConfirmButton={true}
            handleCancel={() => onHide(true)}
            modalHeaderText={(
                <FormattedMessage
                    id='collapsed_reply_threads_modal.title'
                    defaultMessage={'A new way to view and follow threads'}
                />
            )}
            confirmButtonText={(
                <>
                    <FormattedMessage
                        id={'collapsed_reply_threads_modal.take_the_tour'}
                        defaultMessage='Take the Tour'
                    />
                    <NextIcon/>
                </>
            )}
            cancelButtonText={
                <>
                    <FormattedMessage
                        id={'collapsed_reply_threads_modal.skip_tour'}
                        defaultMessage='Skip Tour'
                    />
                </>
            }
        >
            <div>
                <p className='productNotices__helpText'>
                    <FormattedMarkdownMessage
                        id={'collapsed_reply_threads_modal.description'}
                        defaultMessage={'Threads have been revamped to help you create organized conversation around specific messages. Now, channels will appear less cluttered as replies are collapsed under the original message, and all the conversations you\'re following are available in your **Threads** view. Take the tour to see what\'s new.'}
                    />
                </p>
                <img
                    src={crtBetaImg}
                    className='CollapsedReplyThreadsModal__img'
                />
            </div>
        </GenericModal>
    );
}

export default memo(CollapsedReplyThreadsModal);
