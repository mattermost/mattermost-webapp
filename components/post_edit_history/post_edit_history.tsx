// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useRef} from 'react';
import {useIntl} from 'react-intl';
import Scrollbars from 'react-custom-scrollbars';

import {Post} from '@mattermost/types/posts';

import {t} from 'utils/i18n';
import SearchResultsHeader from 'components/search_results_header';

import LoadingScreen from 'components/loading_screen';

import EditedPostItem from './edited_post_item';

export interface Props {
    channelDisplayName: string;
    originalPost: Post;
    postEditHistory?: Post[];
}

const renderView = (props: Record<string, unknown>): JSX.Element => (
    <div
        {...props}
        className='scrollbar--view'
    />
);

const renderThumbHorizontal = (props: Record<string, unknown>): JSX.Element => (
    <div
        {...props}
        className='scrollbar--horizontal'
    />
);

const renderThumbVertical = (props: Record<string, unknown>): JSX.Element => (
    <div
        {...props}
        className='scrollbar--vertical'
    />
);

const PostEditHistory = ({
    channelDisplayName,
    originalPost,
    postEditHistory,
}: Props) => {
    const scrollbars = useRef<Scrollbars | null>(null);
    const {formatMessage} = useIntl();

    useEffect(() => {
        scrollbars.current?.scrollToTop();
    }, [originalPost, postEditHistory]);

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
            <div
                id='rhsContainer'
                className='sidebar-right__body'
            >
                <LoadingScreen
                    style={{
                        display: 'grid',
                        placeContent: 'center',
                        flex: '1',
                    }}
                />
            </div>
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
            <Scrollbars
                ref={scrollbars}
                autoHide={true}
                autoHideTimeout={500}
                autoHideDuration={500}
                renderThumbHorizontal={renderThumbHorizontal}
                renderThumbVertical={renderThumbVertical}
                renderView={renderView}
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
            </Scrollbars>
        </div>
    );
};

export default memo(PostEditHistory);
