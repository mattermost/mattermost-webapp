// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';

import CloseIcon from 'components/widgets/icons/close_icon';
import BackIcon from 'components/widgets/icons/back_icon';

import './full_screen_modal.scss';

// This must be on sync with the animation time in ./full_screen_modal.scss
const ANIMATION_DURATION = 100;

type Props = {
    show: boolean;
    onClose: () => void;
    onGoBack?: () => void;
    children: React.ReactNode;
    ariaLabel: string;
};

export default class FullScreenModal extends React.Component<Props> {
    private modal = React.createRef<HTMLDivElement>();

    public componentDidMount() {
        document.addEventListener('keydown', this.handleKeypress);
        document.addEventListener('focus', this.enforceFocus, true);
        this.resetFocus();
    }

    public componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeypress);
        document.removeEventListener('focus', this.enforceFocus, true);
    }

    private enforceFocus = () => {
        setTimeout(() => {
            const currentActiveElement = document.activeElement;
            if (this.modal && this.modal.current && !this.modal.current.contains(currentActiveElement)) {
                this.modal.current.focus();
            }
        });
    }

    public resetFocus = () => {
        setTimeout(() => {
            if (this.modal && this.modal.current) {
                this.modal.current.focus();
            }
        });
    }

    private handleKeypress = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.props.show) {
            this.close();
        }
    }

    private onBackKeyDown = (e: KeyboardEvent) => {
        const code = e.which;
        if ((code === 13) || (code === 32)) {
            if (this.props.onGoBack) {
                this.props.onGoBack();
            }
        }
    }

    private onCloseKeyDown = (e: KeyboardEvent) => {
        const code = e.which;
        if ((code === 13) || (code === 32)) {
            this.close();
        }
    }

    private close = () => {
        this.props.onClose();
    }

    public render() {
        return (
            <CSSTransition
                in={this.props.show}
                classNames='FullScreenModal'
                mountOnEnter={true}
                unmountOnExit={true}
                timeout={ANIMATION_DURATION}
                appear={true}
            >
                <>
                    <div
                        className='FullScreenModal'
                        ref={this.modal}
                        tabIndex={-1}
                        aria-modal={true}
                        aria-label={this.props.ariaLabel}
                        role='dialog'
                    >
                        {this.props.onGoBack &&
                            <BackIcon
                                tabIndex='0'
                                className='back'
                                onKeyDown={this.onBackKeyDown}
                                id='backIcon'
                                onClick={this.props.onGoBack}
                            />}
                        <CloseIcon
                            tabIndex='0'
                            className='close-x'
                            onClick={this.close}
                            onKeyDown={this.onCloseKeyDown}
                            id='closeIcon'
                        />
                        {this.props.children}
                    </div>
                    <div
                        tabIndex={0}
                        style={{display: 'none'}}
                    />
                </>
            </CSSTransition>
        );
    }
}
