// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import './team_edition.scss';
export interface TeamEditionProps {
    other: string;
}

const TeamEdition: React.FC<TeamEditionProps> = ({other}: TeamEditionProps) => {
    const title = 'Team Edition';
    return (
        <div className='TeamEdition'>
            <p>{title}</p>
            <span>{other}</span>
        </div>
    );
};

export default TeamEdition;
