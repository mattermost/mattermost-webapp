// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import styled from 'styled-components';

import {PostAcknowledgement} from '@mattermost/types/posts';

import AcknowledgementButton from './post_acknowledgement_button';

type Props = {
    list: PostAcknowledgement[];
    hasAcknowledged: boolean;
    hasReactions: boolean;
}

const Divider = styled.div`
    background: rgba(var(--center-channel-text-rgb), 0.08);
    height: 24px;
    margin: 0 4px;
    width: 1px;
`;

function PostAcknowledgements({list, hasAcknowledged, hasReactions}: Props) {
    return (
        <>
            <AcknowledgementButton
                count={list?.length || 0}
                hasAcknowledged={hasAcknowledged}
            />
            {hasReactions && <Divider/>}
        </>
    );
}

export default memo(PostAcknowledgements);
