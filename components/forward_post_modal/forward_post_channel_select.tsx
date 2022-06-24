// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {
    ArchiveOutlineIcon, ChevronDownIcon,
    GlobeIcon,
    LockOutlineIcon,
    MessageTextOutlineIcon,
} from '@mattermost/compass-icons/components';

import React, {useRef} from 'react';

import {useIntl} from 'react-intl';

import {useSelector} from 'react-redux';

import {components, IndicatorProps, ValueType} from 'react-select';

import {Props as AsyncSelectProps} from 'react-select/src/Async';

import {Channel} from '@mattermost/types/channels';

import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getMyTeams, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import {GlobalState} from 'types/store';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import ProfilePicture from 'components/profile_picture';
import SharedChannelIndicator from 'components/shared_channel_indicator';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import {baseStyles} from './forward_post_channel_select_styles';

const AsyncSelect = require('react-select/lib/Async').default as React.ElementType<AsyncSelectProps<ChannelOption>>; // eslint-disable-line global-require

type ProviderResults = {
    matchedPretext: string;
    terms: string[];

    // The providers currently do not provide a clearly defined type and structure
    items: Array<Record<string, any>>;
    component?: React.ReactNode;
}

type ChannelTypeFromProvider = Channel & {
    userId?: string;
}

export type ChannelOption = {
    label: string;
    value: string;
    details: ChannelTypeFromProvider;
}

type GroupedOption = {
    label: React.ReactNode;
    options: ChannelOption[];
}

const FormattedOption = (props: ChannelOption) => {
    const {details} = props;

    const {formatMessage} = useIntl();

    const currentUserId = useSelector((state: GlobalState) => getCurrentUserId(state));
    const user = useSelector((state: GlobalState) => getUser(state, details.userId || ''));
    const status = useSelector((state: GlobalState) => getStatusForUserId(state, details.userId || ''));
    const teammate = useSelector((state: GlobalState) => getDirectTeammate(state, details.id));
    const team = useSelector((state: GlobalState) => getTeam(state, details.team_id));
    const userImageUrl = user?.id && Utils.imageURLForUser(user.id, user.last_picture_update);
    const isPartOfOnlyOneTeam = useSelector((state: GlobalState) => getMyTeams(state).length === 1);

    const channelIsArchived = details.delete_at > 0;

    let icon;
    const iconProps = {
        size: 16,
        color: 'rgba(var(--center-channel-color-rgb), 0.56)',
    };

    if (channelIsArchived) {
        icon = <ArchiveOutlineIcon {...iconProps}/>;
    } else if (details.type === Constants.OPEN_CHANNEL) {
        icon = <GlobeIcon {...iconProps}/>;
    } else if (details.type === Constants.PRIVATE_CHANNEL) {
        icon = <LockOutlineIcon {...iconProps}/>;
    } else if (details.type === Constants.THREADS) {
        icon = <MessageTextOutlineIcon {...iconProps}/>;
    } else if (details.type === Constants.GM_CHANNEL) {
        icon = <div className='status status--group'>{'G'}</div>;
    } else {
        icon = (
            <ProfilePicture
                src={userImageUrl}
                status={teammate && teammate.is_bot ? undefined : status}
                size='sm'
            />
        );
    }

    let customStatus = null;

    let name = details.display_name;
    let description = `~${details.name}`;

    let tag = null;
    if (details.type === Constants.DM_CHANNEL) {
        tag = (
            <>
                <BotBadge
                    show={Boolean(teammate?.is_bot)}
                    className='badge-autocomplete'
                />
                <GuestBadge
                    show={Boolean(teammate && isGuest(teammate.roles))}
                    className='badge-autocomplete'
                />
            </>
        );

        const emojiStyle = {
            marginBottom: 2,
            marginLeft: 8,
        };

        customStatus = (
            <CustomStatusEmoji
                showTooltip={true}
                userID={user.id}
                emojiStyle={emojiStyle}
            />
        );

        const deactivated = user.delete_at ? ` - ${formatMessage({id: 'channel_switch_modal.deactivated', defaultMessage: 'Deactivated'})}` : '';

        if (details.display_name && !teammate?.is_bot) {
            description = `@${user.username}${deactivated}`;
        } else {
            name = user.username;
            if (user.id === currentUserId) {
                name += ` ${formatMessage({id: 'suggestion.user.isCurrent', defaultMessage: '(you)'})}`;
            }
            description = deactivated;
        }
    } else if (details.type === Constants.GM_CHANNEL) {
        // remove the slug from the option
        name = details.display_name;
        description = '';
    }

    const sharedIcon = details.shared ? (
        <SharedChannelIndicator
            className='shared-channel-icon'
            channelType={details.type}
        />
    ) : null;

    const teamName = details.team_id && team ? (
        <span className='option__team-name'>{team.display_name}</span>
    ) : null;

    return (
        <div
            id={`post-forward_channel-select_${details.name}`}
            className='option'
            data-testid={details.name}
            aria-label={name}
        >
            {icon}
            <span className='option__content'>
                <span className='option__content--text'>{name}</span>
                {(isPartOfOnlyOneTeam || details.type === Constants.DM_CHANNEL) && description && (
                    <span className='option__content--description'>{description}</span>
                )}
                {customStatus}
                {sharedIcon}
                {tag}
            </span>
            {!isPartOfOnlyOneTeam && teamName}
        </div>
    );
};

const DropdownIndicator = (props: IndicatorProps<ChannelOption>) => {
    return (
        <components.DropdownIndicator {...props}>
            <ChevronDownIcon
                size={16}
                color={'rgba(var(--center-channel-color-rgb), 0.64)'}
            />
        </components.DropdownIndicator>
    );
};

type Props<O> = {
    onSelect: (channel: ValueType<O>) => void;
    value?: O;
}

function ForwardPostChannelSelect({onSelect, value}: Props<ChannelOption>) {
    const {formatMessage} = useIntl();
    const {current: provider} = useRef<SwitchChannelProvider>(new SwitchChannelProvider());

    const getDefaultResults = () => {
        let options: GroupedOption[] = [];

        const handleDefaultResults = (res: ProviderResults) => {
            options = [
                {
                    label: 'Recent',
                    options: res.items.filter((item) => item.channel.type !== 'threads').map((item) => {
                        const {channel} = item;
                        return {
                            label: channel.display_name || channel.name,
                            value: channel.id,
                            details: channel,
                        };
                    }),
                },
            ];
        };

        provider.fetchAndFormatRecentlyViewedChannels(handleDefaultResults);
        return options;
    };

    const defaultOptions = useRef<GroupedOption[]>(getDefaultResults());

    const handleInputChange = (inputValue: string) => {
        return new Promise<GroupedOption[]>((resolve) => {
            let options: GroupedOption[] = [];
            const handleResults = (res: ProviderResults) => {
                const newOptions: Record<string, any> = {};
                res.items.forEach((item) => {
                    const {channel} = item;
                    const option: ChannelOption = {
                        label: channel.display_name || channel.name,
                        value: channel.id,
                        details: channel,
                    };
                    let dividerLabel = formatMessage({id: 'suggestion.mention.recent.channels', defaultMessage: 'Recent'});
                    switch (channel.type) {
                    case Constants.OPEN_CHANNEL:
                        dividerLabel = formatMessage({id: 'suggestion.search.public', defaultMessage: 'Recent'});
                        break;
                    case Constants.PRIVATE_CHANNEL:
                        dividerLabel = formatMessage({id: 'suggestion.mention.private.channels', defaultMessage: 'Private Channels'});
                        break;
                    case Constants.DM_CHANNEL:
                        dividerLabel = formatMessage({id: 'suggestion.search.direct', defaultMessage: 'Direct Messages'});
                        break;
                    case Constants.GM_CHANNEL:
                        dividerLabel = formatMessage({id: 'suggestion.search.group', defaultMessage: 'Group Messages'});
                        break;
                    }

                    if (!newOptions[channel.type]) {
                        newOptions[channel.type] = {label: dividerLabel, options: []};
                    }
                    newOptions[channel.type].options.push(option);
                });

                options = Object.values(newOptions);
            };

            provider.handlePretextChanged(inputValue, handleResults);
            resolve(options);
        });
    };

    const formatOptionLabel = (channel: ChannelOption) => (
        <FormattedOption
            {...channel}
        />
    );

    return (
        <AsyncSelect
            value={value}
            onChange={onSelect}
            loadOptions={handleInputChange}
            defaultOptions={defaultOptions.current}
            formatOptionLabel={formatOptionLabel}
            components={{DropdownIndicator}}
            styles={baseStyles}
            legend='Forrward to'
            placeholder='Select channel or people'
            className='forward-post__select'
        />
    );
}

export default ForwardPostChannelSelect;
