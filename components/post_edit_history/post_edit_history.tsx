// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import SearchResultsHeader from 'components/search_results_header';
import {Post} from '@mattermost/types/posts';

import LoadingScreen from 'components/loading_screen';

import EditedPostItem from './edited_post_item';

export interface Props {
    channelDisplayName: string;
    originalPost: Post;
    postEditHistory?: Post[];
}

const PostEditHistory = ({
    channelDisplayName,
    originalPost,
    postEditHistory,
}: Props) => {
    const {formatMessage} = useIntl();

    const formattedTitle = formatMessage({
        id: t('search_header.title6'),
        defaultMessage: 'Edit History',
    });

    if (!postEditHistory) {
        return (
            <span/>
        );
    }

    if (postEditHistory.length === 0) {
        return (
            <LoadingScreen
                style={{
                    display: 'grid',
                    placeContent: 'center',
                    flex: '1',
                }}
            />
        );
    }

    const postEditItems = postEditHistory.map((postEdit) => {
        return (
            <EditedPostItem
                key={postEdit.id}
                post={postEdit}
            />);
    });

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <SearchResultsHeader>
                {formattedTitle}
                {<div className='sidebar--right__title__channel'>{channelDisplayName}</div>}
            </SearchResultsHeader>
            <EditedPostItem
                post={originalPost}
                isCurrent={true}
            />
            {postEditItems}
        </div>
    );
};

export default memo(PostEditHistory);
