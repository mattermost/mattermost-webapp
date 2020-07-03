// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { Children, isValidElement, cloneElement } from 'react';

import Card from './card';

import './accordion.scss';

type Props = {
    expandedKey: string;
    children: Card[];
}

export default class Accordion extends React.PureComponent<Props> {
    render() {
        const {children} = this.props;

        const childrenWithProps = Children.map(children, child => {
            // Checking isValidElement is the safe way and avoids a TS error too.
            if (isValidElement(child)) {
                return cloneElement(child, {collapsed: child.props.key !== this.props.expandedKey});
            }
        
            return child;
        });

        return (
            <div
                className={'Accordion'}
            >
                {childrenWithProps}
            </div>
        );
    }
}