// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useReducer} from 'react';

export const ModalStatus = {
    INITIAL: 'initial',
    CLOSE: 'close',
    CLOSING: 'closing',
    TO_SHOW: 'to_show',
    DISPLAYING: 'displaying',
} as const;

type ValueOf<T> = T[keyof T];

const reducerModalStates = (state: ValueOf<typeof ModalStatus>, action: ValueOf<typeof ModalStatus>) => {
    switch (action) {
    case ModalStatus.INITIAL:
    case ModalStatus.CLOSE: {
        if (state !== ModalStatus.CLOSING) {
            return state;
        }

        return action;
    }
    case ModalStatus.TO_SHOW: {
        if (state !== ModalStatus.INITIAL) {
            return state;
        }

        return action;
    }
    case ModalStatus.DISPLAYING: {
        if (state !== ModalStatus.TO_SHOW) {
            return state;
        }

        return action;
    }
    case ModalStatus.CLOSING: {
        if (state !== ModalStatus.DISPLAYING) {
            return state;
        }

        return action;
    }
    default: {
        return state;
    }
    }
};

export const useDelinquencyModal = () => {
    const [state, dispatch] = useReducer(reducerModalStates, ModalStatus.INITIAL);

    const setToDisplay = () => {
        dispatch(ModalStatus.TO_SHOW);
    };

    const setModalDisplayed = () => {
        dispatch(ModalStatus.DISPLAYING);
    };

    const setModalClosed = () => {
        dispatch(ModalStatus.CLOSE);
    };

    const setModalClosing = () => {
        dispatch(ModalStatus.CLOSING);
    };

    return {
        modalState: state,
        setToDisplay,
        setModalClosed,
        setModalDisplayed,
        setModalClosing,
    };
};
