// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import ConfirmModal from 'components/confirm_modal';

type Props = Omit<React.ComponentProps<typeof ConfirmModal>, 'show'> & {
    onHide: () => void;
};

export default function ConfirmModalRedux(props: Props) {
    const {
        onCancel,
        onConfirm,
        onHide, // TODO MM-39580 this should be renamed
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

    return (
        <ConfirmModal
            {...otherProps}
            onCancel={wrappedOnCancel}
            onConfirm={wrappedOnConfirm}
            onExited={onHide}
            show={show}
        />
    );
}
