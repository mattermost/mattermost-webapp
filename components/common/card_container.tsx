// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import './card_container.scss';

type CardContainerProps = {
    children: JSX.Element[] | JSX.Element | string;
    className: string;
}

const CardContainer: React.FC<CardContainerProps> = (props: CardContainerProps) => {
    return (
        <div className={`CardContainer ${props.className}`}>
            {props.children}
        </div>
    );
};

export default CardContainer;
