// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {defineMessages, useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import {Post} from '@mattermost/types/posts';
import GenericModal from 'components/generic_modal';

const modalMessages = defineMessages({
    title: {
        id: t('post_info.edit.restore'),
        defaultMessage: 'Restore this version',
    },
});

type Props = {
    post: Post;
    actions: {
        handleRestore: (post: Post) => void;
    };
    onExited: () => void;
}

const RestorePostModal = ({post, actions, onExited}: Props) => {
    const {formatMessage} = useIntl();
    const onHide = () => onExited();

    const handleRestore = async () => {
        await actions.handleRestore(post);
        onHide();
    };

    const modalHeaderText = (
        <div className='edit-post-history__restore__modal__header'>
            {formatMessage(modalMessages.title) + '?'}
        </div>
    );

    return (
        <GenericModal
            onExited={onHide}
            enforceFocus={false}
            id='restorePostModal'
            aria-labelledby='restorePostModalLabel'
            modalHeaderText={modalHeaderText}
            handleCancel={onHide}
            cancelButtonClassName='cancel-button'
            handleConfirm={handleRestore}
        >
            <div className='edit-post-history__restore__modal__content'>
                {post.message}
            </div>
        </GenericModal>
    );
};

export default memo(RestorePostModal);
