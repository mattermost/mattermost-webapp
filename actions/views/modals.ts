// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Dispatch} from 'redux';
import {ConnectedComponent} from 'react-redux';

import {GenericAction, DispatchFunc} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

import SubMenuModal from 'components/widgets/menu/menu_modals/submenu_modal/submenu_modal';

export type OpenModalData = {
    modalId: string;
    dialogType?: React.FC<any> | ConnectedComponent<any, any> | ((props: any) => JSX.Element) | typeof SubMenuModal;
    dialogProps?: Record<string, any>;
}

export function openModal(modalData: OpenModalData) {
    return (dispatch: DispatchFunc | Dispatch<GenericAction>) => {
        const action = {
            type: ActionTypes.MODAL_OPEN,
            modalId: modalData.modalId,
            dialogProps: modalData.dialogProps,
            dialogType: modalData.dialogType,
        };

        dispatch(action);
        return {data: true};
    };
}

export function closeModal(modalId: string) {
    return (dispatch: DispatchFunc | Dispatch<GenericAction>) => {
        const action = {
            type: ActionTypes.MODAL_CLOSE,
            modalId,
        };

        dispatch(action);
        return {data: true};
    };
}
