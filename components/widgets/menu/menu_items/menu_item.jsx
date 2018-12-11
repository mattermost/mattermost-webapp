// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export default function menuItem(Component) {
    class MenuItem extends React.PureComponent {
        static defaultProps = {
            show: true,
        };

        render() {
            const {id, show, icon, text, ...props} = this.props;
            if (!show) {
                return null;
            }

            let textProp = text;
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
                    className='MenuItem'
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
