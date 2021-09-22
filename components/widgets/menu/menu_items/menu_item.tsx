// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import './menu_item.scss';

export default function menuItem(Component: React.ComponentType<any>) {
    type Props = {
        show: boolean;
        id?: string;
        icon?: React.ReactNode;
        text?: React.ReactNode;
    }
    class MenuItem extends React.PureComponent<Props & React.ComponentProps<typeof Component>> {
        public static defaultProps = {
            show: true,
        };

        public static displayName?: string;

        public render() {
            const {id, show, icon, text, ...props} = this.props;
            if (!show) {
                return null;
            }

            let textProp: React.ReactNode = text;
            if (icon) {
                textProp = (
                    <React.Fragment>
                        <span className='icon'>{icon}</span>
                        {text}
                    </React.Fragment>
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
                        {...props}
                    />
                </li>
            );
        }
    }
    return MenuItem;
}
