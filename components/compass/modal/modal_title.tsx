// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {styled} from '@mui/material/styles';
import MUIDialogTitle, {DialogTitleProps as MUIDialogTitleProps} from '@mui/material/DialogTitle';
import {CloseIcon} from '@mattermost/compass-icons/components';

import Button from '../button/button';

type DialogTitleProps = MUIDialogTitleProps & { hasCloseButton: boolean };

const StyledModalTitle = styled(MUIDialogTitle)<DialogTitleProps>(({hasCloseButton}) => ({
    display: 'grid',
    gridTemplateColumns: '1fr max-content max-content',
    gap: 12,
    fontFamily: 'Metropolis',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: 22,
    lineHeight: '28px',
    color: 'var(--center-channel-color)',
    alignItems: 'center',
    padding: hasCloseButton ? '22px 26px 24px 32px' : '28px 32px 24px',
}));

const StyledModalTitleSection = styled('div')(() => ({
    padding: '0 32px 24px 32px',
}));

type ModalTitleProps = {
    title: string;
    rightSection?: React.ReactNode | React.ReactNode[];
    children?: React.ReactNode | React.ReactNode[];
    onClose?: React.MouseEventHandler;
}

const ModalTitle = ({title, onClose, children, rightSection = null}: ModalTitleProps) => {
    const hasCloseButton = Boolean(onClose);

    return (
        <>
            <StyledModalTitle
                hasCloseButton={hasCloseButton}
                component={'div'}
            >
                {title}
                {rightSection}
                {hasCloseButton && (
                    <Button
                        type='button'
                        onClick={onClose}
                        disableRipple={true}
                        variant={'icon'}
                    >
                        <CloseIcon
                            size={24}
                            color='var(--center-channel-color)'
                        />
                    </Button>
                )}
            </StyledModalTitle>
            {children && (
                <StyledModalTitleSection>
                    {children}
                </StyledModalTitleSection>
            )}
        </>
    );
};

export default ModalTitle;
