// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import React, {memo} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MUIPaper, {PaperProps} from '@mui/material/Paper';
import DialogActions from '@mui/material/DialogActions';
import Slide from '@mui/material/Slide';
import {TransitionProps} from '@mui/material/transitions';

const Transition = React.forwardRef((
    {children, ...props}: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) => {
    return (
        <Slide
            direction='up'
            ref={ref}
            {...props}
        >
            {children}
        </Slide>
    );
});

const Paper = styled(MUIPaper)<PaperProps>(() => ({
    border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
    borderRadius: 12,
    backgroundColor: 'var(--center-channel-bg)',
    boxShadow: '0 20px 32px 0 rgba(0, 0, 0, 0.12)',
    minWidth: 600,
}));

type ModalProps = {
    children: React.ReactNode | React.ReactNodeArray;
    isOpen: boolean;
    dialogClassName?: string;
    dialogId?: string;
    onClose?: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const Modal = ({children, isOpen, onClose, onConfirm, onCancel, dialogClassName = '', dialogId = ''}: ModalProps) => {
    const hasActions = Boolean(onConfirm || onCancel);

    const handleConfirmAction = () => {
        onConfirm?.();
        onClose?.();
    };

    const handleCancelAction = () => {
        onCancel?.();
        onClose?.();
    };

    const theme = createTheme({
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        fontSize: '1.6rem',
                    },
                    input: {
                        height: 'unset',
                        padding: '12px 24px 12px 0',
                        lineHeight: '2.4rem',
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        fontSize: '1.6rem',
                        top: 6,
                    },
                    shrink: ({ownerState}) => ({
                        ...(ownerState.shrink && {
                            top: 2,
                        }),
                    }),
                },
            },
            MuiInput: {
                defaultProps: {
                    disableUnderline: true,
                },
            },
            MuiSelect: {
                styleOverrides: {
                    standard: ({ownerState}) => ({
                        backgroundColor: ownerState?.open ? 'rgba(var(--button-bg-rgb), 0.08)' : 'transparent',
                        color: 'var(--button-bg)',
                        borderRadius: 4,
                        margin: '4px 0',
                        padding: '8px 12px',
                        fontSize: '1.2rem',
                        lineHeight: '1.6rem',
                        minHeight: '1.6rem',

                        '&:hover': {
                            backgroundColor: 'rgba(var(--center-channel-text-rgb), 0.08)',
                        },
                        '&:active': {
                            backgroundColor: 'rgba(var(--button-bg-rgb), 0.08)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(var(--button-bg-rgb), 0.12)',
                        },
                        '&.Mui-focused:not(.Mui-focusVisible)': {
                            backgroundColor: 'transparent',
                        },
                        '&.Mui-focused.Mui-focusVisible': {
                            backgroundColor: 'rgba(var(--button-bg-rgb), 0.12)',
                        },
                    }),
                    icon: {
                        width: 18,
                        height: 18,
                        color: 'var(--button-bg)',
                        fill: 'currentColor',
                        top: 'calc(50% - 9px)',
                        right: 2,
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        background: 'transparent',

                        '&:hover': {
                            background: 'rgba(var(--center-channel-text-rgb), 0.08)',
                        },
                        '&:active': {
                            background: 'rgba(var(--button-bg-rgb), 0.08)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'transparent',
                            boxShadow: 'inset 0 0 0 2px var(--sidebar-active-border)',
                        },
                        '&.Mui-focused:not(.Mui-focusVisible)': {
                            backgroundColor: 'transparent',
                        },
                        '&.Mui-focused.Mui-focusVisible': {
                            backgroundColor: 'transparent',
                            boxShadow: 'inset 0 0 0 2px var(--sidebar-active-border)',
                        },
                    },
                },
            },
            MuiListItemText: {
                styleOverrides: {
                    root: {
                        color: 'var(--center-channel-text)',
                        fontSize: '1.4rem',
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Dialog
                open={isOpen}
                TransitionComponent={Transition}
                PaperComponent={Paper}
                keepMounted={true}
                onClose={onClose}
                aria-describedby='alert-dialog-slide-description'
                role='dialog'
                className={dialogClassName}
                id={dialogId}
            >
                {children}
                {hasActions && (
                    <DialogActions>
                        {onCancel && <Button onClick={handleCancelAction}>{'Cancel'}</Button>}
                        {onConfirm && <Button onClick={handleConfirmAction}>{'Confirm'}</Button>}
                    </DialogActions>
                )}
            </Dialog>
        </ThemeProvider>
    );
};

export default memo(Modal);
