// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';
import {Dictionary} from 'mattermost-redux/types/utilities';

import {t} from 'utils/i18n';

import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import PinIcon from 'components/widgets/icons/pin_icon';
import SearchIcon from 'components/widgets/icons/search_icon';

import {NoResultsVariant} from './types';

interface Props {
    iconGraphic?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;

    variant?: NoResultsVariant;
    titleValues?: Dictionary<ReactNode>;

    subtitleValues?: Dictionary<ReactNode>

    style?: CSSProperties;
}

const iconMap: {[key in NoResultsVariant]: React.ReactNode } = {
    [NoResultsVariant.ChannelSearch]: <SearchIcon className='no-results__icon'/>,
    [NoResultsVariant.Mentions]: <MentionsIcon className='no-results__icon'/>,
    [NoResultsVariant.FlaggedPosts]: <FlagIcon className='no-results__icon'/>,
    [NoResultsVariant.PinnedPosts]: <PinIcon className='no-results__icon'/>,
    [NoResultsVariant.PinnedPosts]: <PinIcon className='no-results__icon'/>,
};

const titleMap: {[key in NoResultsVariant]: MessageDescriptor } = {
    [NoResultsVariant.ChannelSearch]: {
        id: t('no_results.channel_search.title'),
    },
    [NoResultsVariant.Mentions]: {
        id: t('no_results.mentions.title'),
    },
    [NoResultsVariant.FlaggedPosts]: {
        id: t('no_results.flagged_posts.title'),
    },
    [NoResultsVariant.PinnedPosts]: {
        id: t('no_results.pinned_posts.title'),
    },
};

const subtitleMap: {[key in NoResultsVariant]: MessageDescriptor } = {
    [NoResultsVariant.ChannelSearch]: {
        id: t('no_results.channel_search.subtitle'),
    },
    [NoResultsVariant.Mentions]: {
        id: t('no_results.mentions.subtitle'),
    },
    [NoResultsVariant.FlaggedPosts]: {
        id: t('no_results.flagged_posts.subtitle'),
    },
    [NoResultsVariant.PinnedPosts]: {
        id: t('no_results.pinned_posts.subtitle'),
    },
};

const NoResultsIndicator = ({
    iconGraphic,
    title,
    subtitle,
    variant,
    titleValues,
    subtitleValues,
    style,
}: Props) => {
    return (
        <div
            className='no-results__wrapper'
            style={style}
        >

            {iconGraphic ?? (variant && (
                <div className='no-results__variant-wrapper'>
                    {iconMap[variant]}
                </div>
            ))}
            <div className='no-results__title'>
                {title ?? (variant && (
                    <FormattedMessage
                        {...titleMap[variant]}
                        values={titleValues}
                    />
                ))}
            </div>
            <div className='no-results__subtitle'>
                {subtitle ?? (variant && (
                    <FormattedMessage
                        {...subtitleMap[variant]}
                        values={subtitleValues}
                    />
                ))}
            </div>

        </div>
    );
};

export default NoResultsIndicator;
