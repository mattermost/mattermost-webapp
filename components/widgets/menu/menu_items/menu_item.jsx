// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default function menuItem(Component) {
    class MenuItem extends React.PureComponent {
        static propTypes= {
            show: PropTypes.bool,
            id: PropTypes.string,
            icon: PropTypes.node,
            text: PropTypes.string,
        };
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
