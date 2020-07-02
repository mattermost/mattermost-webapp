// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './card.scss';

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

type Props = {

}

export default class Card extends React.PureComponent<Props> {
    public static Header = CardHeader;
    public static Body = CardBody;

    render() {
        return (
            <div className='Card'>
                {this.props.children}
            </div>
        );
    }
}