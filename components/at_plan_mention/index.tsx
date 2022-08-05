// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    plan: string;

}

function AtPlanMention(props: Props) {
    const handleClick = () => {
        console.log('CLICKED', props.plan);
    };
    return (
        <a
            onClick={handleClick}
        >
            {props.plan}
        </a>

    );
}

export default AtPlanMention;
