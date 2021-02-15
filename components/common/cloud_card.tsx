// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import './cloud_card.scss';

type CloudCardProps = {
    children: JSX.Element[] | JSX.Element | string;
    className: string;
}

const CloudCard: React.FC<CloudCardProps> = (props: CloudCardProps) => {
    return (
        <div className={`CloudCard ${props.className}`}>
            {props.children}
        </div>
    );
};

export default CloudCard;
