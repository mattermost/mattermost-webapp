// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Action} from 'mattermost-redux/types/actions';
import {AppForm, AppCallRequest} from 'mattermost-redux/types/apps';

import {openModal} from 'actions/views/modals';

import AppsForm from 'components/apps_form';

import {ModalIdentifiers} from 'utils/constants';

export function openAppsModal(form: AppForm, call: AppCallRequest): Action {
    return openModal({
        modalId: ModalIdentifiers.APPS_MODAL,
        dialogType: AppsForm,
        dialogProps: {
            form,
            call,
        },
    });
}
