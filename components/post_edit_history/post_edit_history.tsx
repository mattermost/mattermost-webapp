// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import styled from 'styled-components';

import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import SearchResultsHeader from 'components/search_results_header';
import {Post} from '@mattermost/types/posts';

import EditedPostItem from './edited_post_item';

const Divider = styled.div`
    width: 88%;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.04);
    margin: 0 auto;
`;

export interface Props {
    channelDisplayName: string;
}

const PostEditHistory = ({
    channelDisplayName,
}: Props) => {
    // const currentUserId = currentUser.id;
    // const channelURL = getSiteURL() + '/' + currentTeam.name + '/channels/' + channel.name;
    const {formatMessage} = useIntl();

    const formattedTitle = formatMessage({
        id: t('search_header.title6'),
        defaultMessage: 'Edit History',
    });

    const oldMessages = {
        mes1: {
            channel_id: "dzk69t1zrjfkpgyceq9ihjzm8o",
            create_at: 1661640548738,
            delete_at: 0,
            edit_at: 1661640552223,
            hashtags: "",
            id: "ixj6urk1ifdbucx9j63j7ojk6h",
            is_pinned: false,
            last_reply_at: 0,
            message: "original message test",
            metadata: {},
            original_id: "",
            participants: null,
            pending_post_id: "",
            props: { disable_group_highlight: true },
            reply_count: 0,
            root_id: "",
            type: "",
            update_at: 1661640552223,
            user_id: "75f4ddithty1bft8sdy5cie14a",
        } as unknown as Post,
        mes2: {
            message: 'message-2',
            picture: 'pic-2',
            user: 'user-2',
            date: 'asd',
        },
        mes3: {
            message: 'message-3',
            picture: 'pic-3',
            user: 'user-3',
            date: 'asd',
        },
    };

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <SearchResultsHeader>
                {formattedTitle}
                {<div className='sidebar--right__title__channel'>{channelDisplayName}</div>}
            </SearchResultsHeader>
            <Divider/>
            <EditedPostItem
                post={oldMessages.mes1}
            />
        </div>
    );
};

export default memo(PostEditHistory);
