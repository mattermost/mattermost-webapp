// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';

import {t} from 'utils/i18n';

import searchImage from 'images/search.svg';

import {NoResultsVariant} from './types';

interface Props {
    variant: NoResultsVariant;
    formattedMessageValues?: {[key: string]: string};
}

const iconMap: {[key in NoResultsVariant]: string } = {
    [NoResultsVariant.ChannelSearch]: searchImage,

    // this will be changed soon in the PRs following the other no results indicators
    [NoResultsVariant.Mentions]: '',
    [NoResultsVariant.FlaggedPosts]: '',
    [NoResultsVariant.PinnedPosts]: '',
};

const titleMap: {[key in NoResultsVariant]: MessageDescriptor } = {
    [NoResultsVariant.ChannelSearch]: {
        id: t('no_results.channel_search.title')
    },

    // this will be changed soon in the PRs following the other no results indicators
    [NoResultsVariant.Mentions]: {},
    [NoResultsVariant.FlaggedPosts]: {},
    [NoResultsVariant.PinnedPosts]: {},
};

const subtitleMap: {[key in NoResultsVariant]: MessageDescriptor } = {
    [NoResultsVariant.ChannelSearch]: {
        id: t('no_results.channel_search.subtitle')
    },

    // this will be changed soon in the PRs following the other no results indicators
    [NoResultsVariant.Mentions]: {},
    [NoResultsVariant.FlaggedPosts]: {},
    [NoResultsVariant.PinnedPosts]: {},
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
                        values: props.formattedMessageValues
                    }}
                />
            </div>
            <FormattedMessage
                {...subtitleMap[props.variant]}
            />
        </div>
    );
};

export default NoResultsIndicator;
