// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Constants from 'utils/constants';

import MenuWrapperAnimation from './menu_wrapper_animation';

import './menu_wrapper.scss';

type Props = {
    children?: React.ReactNode;
    className: string;
    onToggle?: (open: boolean) => void;
    animationComponent: any;
    id?: string;
}

type State = {
    open: boolean;
}

export default class MenuWrapper extends React.PureComponent<Props, State> {
    private node: React.RefObject<HTMLDivElement>;

    public static defaultProps = {
        className: '',
        animationComponent: MenuWrapperAnimation,
    };

    public constructor(props: Props) {
        super(props);
        if (!Array.isArray(props.children) || props.children.length !== 2) {
            throw new Error('MenuWrapper needs exactly 2 children');
        }
        this.state = {
            open: false,
        };
        this.node = React.createRef();
    }

    public componentDidMount() {
        document.addEventListener('click', this.closeOnBlur, true);
        document.addEventListener('keyup', this.keyboardClose, true);
    }

    public componentWillUnmount() {
        document.removeEventListener('click', this.closeOnBlur, true);
        document.removeEventListener('keyup', this.keyboardClose, true);
    }

    private keyboardClose = (e: KeyboardEvent) => {
        if (e.key === Constants.KeyCodes.ESCAPE[0]) {
            this.close();
        }

        if (e.key === Constants.KeyCodes.TAB[0]) {
            this.closeOnBlur(e);
        }
    }

    private closeOnBlur = (e: Event) => {
        if (this.node && this.node.current && e.target && this.node.current.contains(e.target as Node)) {
            return;
        }

        this.close();
    }

    private close = () => {
        if (this.state.open) {
            this.setState({open: false});
            if (this.props.onToggle) {
                this.props.onToggle(false);
            }
        }
    }

    private toggle = () => {
        const newState = !this.state.open;
        this.setState({open: newState});
        if (this.props.onToggle) {
            this.props.onToggle(newState);
        }
    }

    public render() {
        const {children} = this.props;

        const Animation = this.props.animationComponent;

        return (
            <div
                id={this.props.id}
                className={'MenuWrapper ' + this.props.className}
                onClick={this.toggle}
                ref={this.node}
            >
                {children ? Object.values(children)[0] : {}}
                <Animation show={this.state.open}>
                    {children ? Object.values(children)[1] : {}}
                </Animation>
            </div>
        );
    }
}
