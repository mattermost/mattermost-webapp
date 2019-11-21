// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {intlShape} from 'react-intl';

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

    public static contextTypes = {
        intl: intlShape.isRequired,
    };

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
                            <button
                                onClick={this.props.onGoBack}
                                className='back'
                                aria-label={this.context.intl.formatMessage({id: 'full_screen_modal.back', defaultMessage: 'Back'})}
                            >
                                <BackIcon id='backIcon'/>
                            </button>}
                        <button
                            onClick={this.close}
                            className='close-x'
                            aria-label={this.context.intl.formatMessage({id: 'full_screen_modal.close', defaultMessage: 'Close'})}
                        >
                            <CloseIcon id='closeIcon'/>
                        </button>
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
