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
        isCompUnmounted: boolean;
        isListenerAdded: boolean;
    }
    class MenuItem extends React.PureComponent<Props & React.ComponentProps<typeof Component>, State> {
        constructor(props: Props) {
            super(props);

            this.state = {
                currentFocus: 0,
                isCompUnmounted: true,
                isListenerAdded: true,
            };
        }

        componentDidMount() {
            document.addEventListener('keydown', this.handleKeyDown);
        }

        componentWillUnmount() {
            document.removeEventListener('keydown', this.handleKeyDown);
        }

        handleKeyDown = (e: KeyboardEvent) => {
            const {key} = e;
            const {size} = this.props;

            //should only run for key(UP and DOWN) & follow the default behaviour for key(TAB & SHIFT + TAB)
            if (key === Constants.KeyCodes.DOWN[0]) {
                // Down arrow
                e.preventDefault();
                this.setState((state) => ({currentFocus: state.currentFocus === size - 1 ? 0 : state.currentFocus + 1}));
            } else if (key === Constants.KeyCodes.UP[0]) {
                // Up arrow
                e.preventDefault();
                this.setState((state) => ({currentFocus: state.currentFocus === 0 ? size - 1 : state.currentFocus - 1}));
            }
        };

        setRoveFocus = (index: number) => {
            return [this.state.currentFocus, () => {
                this.setState({currentFocus: index});
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
                        index={index}
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
