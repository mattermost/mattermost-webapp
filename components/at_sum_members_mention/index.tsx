// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    text: string;
    userIds: string[];
}

function AtSumOfMembersMention(props: Props) {
    return (
        <a
            onClick={() => {
                console.log('I WAS CLICKED', props.userIds);
            }}
        >
            {props.text}
        </a>

    );
}

export default AtSumOfMembersMention;
