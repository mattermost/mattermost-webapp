// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import Constants from 'utils/constants';

import './menu_item.scss';

export default function menuItem(Component: React.ComponentType<any>) {
    type Props = {
        show: boolean;
        id?: string;
        icon?: React.ReactNode;
        text?: React.ReactNode;
        index?: number;
        size?: number;
    }

    type State = {
        currentFocus: number;
        size: number;
        isCompUnmounted: boolean;
        isListenerAdded: boolean;
    }
    class MenuItem extends React.PureComponent<Props & React.ComponentProps<typeof Component>, State> {
        constructor(props: Props) {
            super(props);

            this.state = {
                currentFocus: 0,
                size: this.props.size,
                isCompUnmounted: true,
                isListenerAdded: true,
            };
        }

        // original article taken from https://dev.to/rafi993/roving-focus-in-react-with-custom-hooks-1ln
        setRoveFocus = (size: number) => {
            const handlKeyDown = (e: KeyboardEvent) => {
                const {key} = e;

                //should only run for key(UP and DOWN) & follow the default behaviour for key(TAB & SHIFT + TAB)
                if (key === Constants.KeyCodes.DOWN[0]) {
                    // Down arrow
                    e.preventDefault();
                    this.setState((state) => ({currentFocus: state.currentFocus === state.size - 1 ? 0 : state.currentFocus + 1, isListenerAdded: false}));
                } else if (key === Constants.KeyCodes.UP[0]) {
                    // Up arrow
                    e.preventDefault();
                    this.setState((state) => ({currentFocus: state.currentFocus === 0 ? state.size - 1 : state.currentFocus - 1, isListenerAdded: false}));
                }
            };
            if (this.state.isListenerAdded && size) {
                document.addEventListener('keydown', handlKeyDown, false);
            } else {
                document.removeEventListener('keydown', handlKeyDown, false);
            }

            return [this.state.currentFocus, (e: number) => {
                this.setState({currentFocus: e});
            }];
        }

        public static defaultProps = {
            show: true,
        };

        public static displayName?: string;

        public render() {
            const {id, show, icon, text, index, size, ...props} = this.props;
            const [focus, setFocus] = this.setRoveFocus(size);
            if (!show) {
                return null;
            }

            let textProp: React.ReactNode = text;
            if (icon) {
                textProp = (
                    <>
                        <span className='icon'>{icon}</span>
                        {text}
                    </>
                );
            }

            return (
                <li
                    className={classNames('MenuItem', {
                        'MenuItem--with-icon': icon,
                    })}
                    role='menuitem'
                    id={id}
                >
                    <Component
                        text={textProp}
                        ariaLabel={text?.toString()}
                        index={index && index}
                        setFocus={setFocus}
                        focus={focus === index}
                        {...props}
                    />
                </li>
            );
        }
    }
    return MenuItem;
}
