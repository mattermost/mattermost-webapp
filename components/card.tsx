// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './card.scss';
import classNames from 'classnames';

type Props = {
    collapsed: boolean;
}

const CardHeader: React.FC<{children: JSX.Element}> = ({children}) => {
    return (
        <div className='Card__header'>
            {children}
        </div>
    );
}

const CardBody: React.FC<{children: JSX.Element}> = ({children}) => {
    return (
        <div className='Card__body'>
            {children}
        </div>
    );
}

export default class Card extends React.PureComponent<Props> {
    public static Header = CardHeader;
    public static Body = CardBody;

    render() {
        const {collapsed, children} = this.props;

        return (
            <div
                className={classNames('Card', {
                    collapsed,
                })}
            >
                {children}
            </div>
        );
    }
}