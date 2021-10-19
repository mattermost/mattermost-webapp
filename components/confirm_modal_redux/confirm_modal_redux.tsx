// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import ConfirmModal from 'components/confirm_modal';

type Props = Omit<React.ComponentProps<typeof ConfirmModal>, 'show'> & {
    closeModal: (modalId: string) => void;
    modalId: string;
};

export default function ConfirmModalRedux(props: Props) {
    const {
        closeModal,
        onCancel,
        onConfirm,
        onExited,
        modalId,
        ...otherProps
    } = props;

    const [show, setShow] = useState(true);

    const wrappedOnCancel = useCallback((checked) => {
        onCancel?.(checked);

        setShow(false);
    }, [onCancel]);
    const wrappedOnConfirm = useCallback((checked) => {
        onConfirm?.(checked);

        setShow(false);
    }, [onConfirm]);
    const wrappedOnExited = useCallback(() => {
        onExited?.();

        closeModal(modalId);
    }, [closeModal, modalId]);

    return (
        <ConfirmModal
            {...otherProps}
            onCancel={wrappedOnCancel}
            onConfirm={wrappedOnConfirm}
            onExited={wrappedOnExited}
            show={show}
        />
    );
}
