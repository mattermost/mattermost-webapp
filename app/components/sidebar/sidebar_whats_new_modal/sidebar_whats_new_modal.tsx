// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import GenericModal from 'components/generic_modal';

import whatsNewImg from 'images/whats-new-1.5.gif';

import {ModalIdentifiers} from 'utils/constants';

import './sidebar_whats_new_modal.scss';

type Props = {
    currentUserId: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        closeModal: (modalId: string) => void;
    };
}

export default function SidebarWhatsNewModal(props: Props) {
    const onHide = () => {
        props.actions.savePreferences(props.currentUserId, [{
            user_id: props.currentUserId,
            category: Preferences.CATEGORY_WHATS_NEW_MODAL,
            name: Preferences.HAS_SEEN_SIDEBAR_WHATS_NEW_MODAL,
            value: 'true',
        }]);

        props.actions.closeModal(ModalIdentifiers.SIDEBAR_WHATS_NEW_MODAL);
    };

    return (
        <GenericModal
            show={true}
            onHide={onHide}
            handleConfirm={onHide}
            modalHeaderText={(
                <FormattedMessage
                    id={'sidebar_whats_new_modal.header'}
                    defaultMessage={'What\'s new'}
                />
            )}
            confirmButtonText={(
                <FormattedMessage
                    id={'sidebar_whats_new_modal.confirm'}
                    defaultMessage='Got it'
                />
            )}
        >
            <span className='SidebarWhatsNewModal__helpText'>
                <FormattedMessage
                    id={'sidebar_whats_new_modal.whatsNewText'}
                    defaultMessage='Create custom categories in your sidebar. Drag and drop to organize channels and categories.'
                />
            </span>
            <img
                className='SidebarWhatsNewModal__img'
                src={whatsNewImg}
            />
        </GenericModal>
    );
}
