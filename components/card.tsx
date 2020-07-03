// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { Children, isValidElement, cloneElement } from 'react';

import './card.scss';
import classNames from 'classnames';

type Props = {
    key: string;
    collapsed: boolean;
}

const CardHeader: React.FC<{children: JSX.Element}> = ({children}) => {
    return (
        <div className='Card__header'>
            {children}
        </div>
    );
}

const CardBody: React.FC<{children: JSX.Element, collapsed?: boolean}> = ({children, collapsed}) => {
    return (
        <div className={classNames('Card__body', {collapsed})}>
            {children}
        </div>
    );
}

export default class Card extends React.PureComponent<Props> {
    public static Header = CardHeader;
    public static Body = CardBody;

    render() {
        const {collapsed, children} = this.props;

        const childrenWithProps = Children.map(children, child => {
            // Checking isValidElement is the safe way and avoids a TS error too.
            if (isValidElement(child)) {
                return cloneElement(child, {collapsed});
            }
        
            return child;
        });

        return (
            <div
                className={'Card'}
            >
                {childrenWithProps}
            </div>
        );
    }
}