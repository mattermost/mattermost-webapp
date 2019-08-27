// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {CSSTransition} from 'react-transition-group';

import CloseIcon from 'components/widgets/icons/close_icon';

import './full_screen_modal.scss';

// This must be on sync with the animation time in ./full_screen_modal.scss
const ANIMATION_DURATION = 100;

type Props = {
    show: boolean;
    onClose: () => void;
};

export default class FullScreenModal extends React.Component<Props> {
    public static propTypes = {
        show: PropTypes.bool.isRequired,
        children: PropTypes.node.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    public componentDidMount(): void {
        document.addEventListener('keydown', this.handleKeypress);
    }

    public componentWillUnmount(): void {
        document.removeEventListener('keydown', this.handleKeypress);
    }

    private handleKeypress = (e: KeyboardEvent): void => {
        if (e.key === 'Escape' && this.props.show) {
            this.close();
        }
    }

    private close = (): void => {
        this.props.onClose();
    }

    public render(): React.ReactNode {
        return (
            <CSSTransition
                in={this.props.show}
                classNames='FullScreenModal'
                mountOnEnter={true}
                unmountOnExit={true}
                timeout={ANIMATION_DURATION}
                appear={true}
            >
                <div className='FullScreenModal'>
                    <CloseIcon
                        className='close-x'
                        onClick={this.close}
                    />
                    {this.props.children}
                </div>
            </CSSTransition>
        );
    }
}
