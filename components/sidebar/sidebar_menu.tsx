// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

const MENU_BOTTOM_MARGIN = 80;

type Props = {
    id: string;
    tooltipText: string;
    buttonAriaLabel: string;
    ariaLabel: string;
    refCallback?: (ref: SidebarMenu) => void;
};

type State = {
    isMenuOpen: boolean;
    openUp: boolean;
    width: number;
};

export default class SidebarMenu extends React.PureComponent<Props, State> {
    menuRef?: Menu;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            isMenuOpen: false,
            openUp: false,
            width: 0,
        };

        this.menuButtonRef = React.createRef();
        this.isLeaving = false;
    }

    // TODO: Temporary code to keep the menu in place while scrolling
    componentDidMount() {
        const scrollbars = document.querySelectorAll('#SidebarContainer .SidebarNavContainer .scrollbar--view');
        if (scrollbars && scrollbars[0]) {
            scrollbars[0].addEventListener('scroll', this.setMenuPosition);
        }
    }

    componentWillUnmount() {
        const scrollbars = document.querySelectorAll('#SidebarContainer .SidebarNavContainer .scrollbar--view');
        if (scrollbars && scrollbars[0]) {
            scrollbars[0].removeEventListener('scroll', this.setMenuPosition);
        }
    }

    refCallback = (ref: Menu) => {
        if (ref) {
            this.menuRef = ref;

            const rect = ref.rect();
            const buttonRect = this.menuButtonRef.current?.getBoundingClientRect();
            const y = typeof buttonRect?.y === 'undefined' ? buttonRect?.top : buttonRect.y;
            const windowHeight = window.innerHeight;

            const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
            const spaceOnTop = y || 0;
            const spaceOnBottom = totalSpace - spaceOnTop;

            this.setState({
                openUp: (spaceOnTop > spaceOnBottom),
                width: rect?.width || 0,
            }, () => {
                if (this.props.refCallback) {
                    this.props.refCallback(this);
                }
            });
        }
    }

    setMenuPosition = () => {
        if (this.state.isMenuOpen && this.menuButtonRef.current && this.menuRef) {
            const menuRef = this.menuRef.node.current?.parentElement as HTMLDivElement;
            const openUpOffset = this.state.openUp ? -this.menuButtonRef.current.getBoundingClientRect().height : 0;
            menuRef.style.top = `${this.menuButtonRef.current.getBoundingClientRect().top + this.menuButtonRef.current.clientHeight + openUpOffset}px`;
        }
    }

    handleMenuToggle = (isMenuOpen: boolean) => {
        this.setState({isMenuOpen}, () => {
            this.setMenuPosition();
        });
    }

    render() {
        const {tooltipText, buttonAriaLabel, ariaLabel, id, children} = this.props;

        const tooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                {tooltipText}
            </Tooltip>
        );

        return (
            <MenuWrapper
                className={classNames('SidebarMenu', {
                    menuOpen: this.state.isMenuOpen,
                })}
                onToggle={this.handleMenuToggle}
                stopPropagationOnToggle={true}
            >
                <button
                    ref={this.menuButtonRef}
                    className='SidebarMenu_menuButton'
                    aria-label={buttonAriaLabel}
                >
                    <OverlayTrigger
                        delayShow={500}
                        placement='top'
                        overlay={tooltip}
                    >
                        <i className='icon-dots-vertical'/>
                    </OverlayTrigger>
                </button>
                <Menu
                    ref={this.refCallback}
                    openUp={this.state.openUp}
                    id={`SidebarMenu-${id}`}
                    ariaLabel={ariaLabel}
                >
                    {children}
                </Menu>
            </MenuWrapper>
        );
    }
}
