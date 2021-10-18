// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';
import {FormattedMessage, MessageDescriptor} from 'react-intl';
import classNames from 'classnames';

import {Dictionary} from 'mattermost-redux/types/utilities';

import {t} from 'utils/i18n';

import FlagIcon from 'components/widgets/icons/flag_icon';
import MentionsIcon from 'components/widgets/icons/mentions_icon';
import PinIcon from 'components/widgets/icons/pin_icon';
import SearchIcon from 'components/widgets/icons/search_icon';

import {NoResultsVariant} from './types';

interface Props {
    expanded?: boolean;
    iconGraphic?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    variant?: NoResultsVariant;
    titleValues?: Dictionary<ReactNode>;
    subtitleValues?: Dictionary<ReactNode>;
    style?: CSSProperties;
}

const iconMap: {[key in NoResultsVariant]: React.ReactNode } = {
    [NoResultsVariant.ChannelSearch]: <SearchIcon className='no-results__icon'/>,
    [NoResultsVariant.Mentions]: <MentionsIcon className='no-results__icon'/>,
    [NoResultsVariant.FlaggedPosts]: <FlagIcon className='no-results__icon'/>,
    [NoResultsVariant.PinnedPosts]: <PinIcon className='no-results__icon'/>,
    [NoResultsVariant.ChannelFiles]: <i className='icon icon-file-text-outline no-results__icon'/>,
    [NoResultsVariant.ChannelFilesFiltered]: <i className='icon icon-file-text-outline no-results__icon'/>,
};

const titleMap: {[key in NoResultsVariant]: MessageDescriptor} = {
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
    [NoResultsVariant.ChannelFiles]: {
        id: t('no_results.channel_files.title'),
    },
    [NoResultsVariant.ChannelFilesFiltered]: {
        id: t('no_results.channel_files_filtered.title'),
    },
};

const subtitleMap: {[key in NoResultsVariant]: MessageDescriptor} = {
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
    [NoResultsVariant.ChannelFiles]: {
        id: t('no_results.channel_files.subtitle'),
    },
    [NoResultsVariant.ChannelFilesFiltered]: {
        id: t('no_results.channel_files_filtered.subtitle'),
    },
};

import './no_results_indicator.scss';

const NoResultsIndicator = ({
    expanded,
    style,
    variant,
    iconGraphic = variant ? (
        <div className='no-results__variant-wrapper'>
            {iconMap[variant]}
        </div>
    ) : null,
    titleValues,
    title = variant ? (
        <FormattedMessage
            {...titleMap[variant]}
            values={titleValues}
        />
    ) : null,
    subtitleValues,
    subtitle = variant ? (
        <FormattedMessage
            {...subtitleMap[variant]}
            values={subtitleValues}
        />
    ) : null,
}: Props) => {
    let content = (
        <div
            className='no-results__wrapper'
            style={style}
        >
            {iconGraphic}

            {title ? (
                <h3 className={classNames('no-results__title', {'only-title': !subtitle})}>
                    {title}
                </h3>
            ) : null}

            {subtitle ? (
                <div className='no-results__subtitle'>
                    {subtitle}
                </div>
            ) : null}

        </div>
    );

    if (expanded) {
        content = (
            <div className='no-results__holder'>
                {content}
            </div>
        );
    }

    return content;
};

export default NoResultsIndicator;
