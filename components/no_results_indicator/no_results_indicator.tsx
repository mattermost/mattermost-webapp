// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';

import {t} from 'utils/i18n';

import searchImage from 'images/search.svg';
import pinnedPostsImage from 'images/pinned_posts.svg';
import mentionsImage from 'images/mentions.svg';
import flaggedPostsImage from 'images/flagged_posts.svg';

import {NoResultsVariant} from './types';

interface Props {
    variant: NoResultsVariant;
    titleValues?: {[key: string]: string};
    subtitleValues?: {[key: string]: string} | {[key: string]: {}};
}

const iconMap: {[key in NoResultsVariant]: string } = {
    [NoResultsVariant.ChannelSearch]: searchImage,
    [NoResultsVariant.Mentions]: mentionsImage,
    [NoResultsVariant.FlaggedPosts]: flaggedPostsImage,
    [NoResultsVariant.PinnedPosts]: pinnedPostsImage,
};

const titleMap: {[key in NoResultsVariant]: MessageDescriptor } = {
    [NoResultsVariant.ChannelSearch]: {
        id: t('no_results.channel_search.title')
    },
    [NoResultsVariant.Mentions]: {
        id: t('no_results.mentions.title')
    },
    [NoResultsVariant.FlaggedPosts]: {
        id: t('no_results.flagged_posts.title')
    },
    [NoResultsVariant.PinnedPosts]: {
        id: t('no_results.pinned_posts.title')
    },
};

const subtitleMap: {[key in NoResultsVariant]: MessageDescriptor } = {
    [NoResultsVariant.ChannelSearch]: {
        id: t('no_results.channel_search.subtitle')
    },
    [NoResultsVariant.Mentions]: {
        id: t('no_results.mentions.subtitle')
    },
    [NoResultsVariant.FlaggedPosts]: {
        id: t('no_results.flagged_posts.subtitle')
    },
    [NoResultsVariant.PinnedPosts]: {
        id: t('no_results.pinned_posts.subtitle')
    },
};

const NoResultsIndicator = (props: Props) => {
    return (
        <div
            className='no-results__wrapper'
        >
            <div className='no-results__variant-wrapper'>
                <img
                    className='no-results__search-image'
                    src={iconMap[props.variant]}
                />
            </div>
            <div className='no-results__title'>
                <FormattedMessage
                    {...{
                        ...titleMap[props.variant],
                        values: props.titleValues
                    }}
                />
            </div>
            <FormattedMessage
                {...{
                    ...subtitleMap[props.variant],
                    values: props.subtitleValues
                }}
            />
        </div>
    );
};

export default NoResultsIndicator;
