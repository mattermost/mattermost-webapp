// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ElementType, MouseEvent, ReactNode} from 'react';
import {useIntl} from 'react-intl';

import {ModalData} from 'types/actions';

type Props = {
    ariaLabel?: string;
    children: ReactNode;
    modalId: string;
    dialogType: ElementType;
    dialogProps?: Record<string, any>;
    onClick?: () => void;
    className?: string;
    showUnread?: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
    };
};

const ToggleModalButton = ({ariaLabel, children, modalId, dialogType, dialogProps = {}, onClick, className = '', showUnread, actions}: Props) => {
    const intl = useIntl();

    const show = (e: MouseEvent<HTMLButtonElement>) => {
        if (e) {
            e.preventDefault();
        }

        const modalData = {
            modalId,
            dialogProps,
            dialogType,
        };

        actions.openModal(modalData);
    };

    const ariaLabelElement = ariaLabel ? intl.formatMessage({
        id: 'accessibility.button.dialog',
        defaultMessage: '{dialogName} dialog',
    }, {
        dialogName: ariaLabel,
    }) : undefined;

    const badge = showUnread ? <span className={'unread-badge'}/> : null;

    // allow callers to provide an onClick which will be called before the modal is shown
    let clickHandler = (e: MouseEvent<HTMLButtonElement>) => show(e);
    if (onClick) {
        clickHandler = (e) => {
            onClick();
            show(e);
        };
    }

    return (
        <button
            className={'style--none ' + className}
            aria-label={ariaLabelElement}
            onClick={clickHandler}
        >
            {children}
            {badge}
        </button>
    );
};

export default ToggleModalButton;
