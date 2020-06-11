// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import GenericModal from 'components/generic_modal';

import './sidebar_whats_new_modal.scss';

type Props = {
    currentUserId: string;
    hasSeenModal: boolean;
    newSidebarPreference: boolean;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
    };
}

type State = {
    isUsingNewSidebar: boolean;
}

export default class SidebarWhatsNewModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isUsingNewSidebar: props.newSidebarPreference,
        };
    }

    onHide = () => {
        this.props.actions.savePreferences(this.props.currentUserId, [{
            user_id: this.props.currentUserId,
            category: Preferences.CATEGORY_WHATS_NEW_MODAL,
            name: Preferences.HAS_SEEN_SIDEBAR_WHATS_NEW_MODAL,
            value: 'true',
        }]);
    }

    render() {
        return (
            <GenericModal
                show={true}
                //show={!this.props.hasSeenModal && this.state.isUsingNewSidebar}
                onHide={this.onHide}
                modalHeaderText={(
                    <FormattedMessage
                        id={'sidebar_whats_new_modal.header'}
                        defaultMessage={'What\'s new'}
                    />
                )}
                handleConfirm={() => {}}
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
                <div className='SidebarWhatsNewModal__img'/>
            </GenericModal>
        );
    }
}
