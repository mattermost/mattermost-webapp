// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {
    ArchiveOutlineIcon, ChevronDownIcon,
    GlobeIcon,
    LockOutlineIcon,
    MessageTextOutlineIcon,
} from '@mattermost/compass-icons/components';

import * as CSS from 'csstype';

import React, {CSSProperties, useRef} from 'react';

import {useIntl} from 'react-intl';

import {useSelector} from 'react-redux';

import {components, ControlProps, IndicatorProps, ValueType} from 'react-select';

import {Props as AsyncSelectProps} from 'react-select/src/Async';

import {Channel} from '@mattermost/types/channels';

import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getMyTeams, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import {GlobalState} from '../../types/store';
import Constants from '../../utils/constants';
import * as Utils from '../../utils/utils';
import CustomStatusEmoji from '../custom_status/custom_status_emoji';
import ProfilePicture from '../profile_picture';
import SharedChannelIndicator from '../shared_channel_indicator';
import SwitchChannelProvider from '../suggestion/switch_channel_provider';
import BotBadge from '../widgets/badges/bot_badge';
import GuestBadge from '../widgets/badges/guest_badge';

const AsyncSelect = require('react-select/lib/Async').default as React.ElementType<AsyncSelectProps<ChannelOption>>; // eslint-disable-line global-require

type ProviderResults = {
    matchedPretext: string;
    terms: string[];

    // The providers currently do not provide a clearly defined type and structure
    items: Array<Record<string, any>>;
    component?: React.ReactNode;
}

export type ChannelOption = {
    label: string;
    value: string;
    details: Channel;
}

type GroupedOption = {
    label: string | React.ReactElement;
    options: ChannelOption[];
}

type CSSPropertiesWithPseudos = CSSProperties & { [P in CSS.SimplePseudos]?: CSS.Properties };

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
                {name}
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
                    switch (channel.type) {
                    case Constants.OPEN_CHANNEL:
                    case Constants.PRIVATE_CHANNEL:
                    case Constants.DM_CHANNEL:
                    case Constants.GM_CHANNEL:
                        if (!newOptions[channel.type]) {
                            newOptions[channel.type] = {label: channel.type, options: []};
                        }
                        newOptions[channel.type].options.push(option);
                        break;
                    }
                });

                options = Object.values(newOptions);
            };

            provider.handlePretextChanged(inputValue, handleResults);
            resolve(options);
        });
    };
    const baseStyles = {
        input: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            padding: 0,
            margin: 0,
            color: 'var(--center-channel-color)',
        }),

        // disabling this rule here since otherwise tsc will complain about it in the props
        // eslint-disable-next-line @typescript-eslint/ban-types
        control: (provided: CSSProperties, state: ControlProps<{}>): CSSPropertiesWithPseudos => {
            const focusShadow = 'inset 0 0 0 2px var(--button-bg)';

            return ({
                ...provided,
                color: 'var(--center-channel-color)',
                backgroundColor: 'var(--center-channel-bg)',
                cursor: 'pointer',
                border: 'none',
                boxShadow: state.isFocused ? focusShadow : 'inset 0 0 0 1px rgba(var(--center-channel-color-rgb), 0.16)',
                borderRadius: '4px',
                padding: 0,

                ':hover': {
                    color: state.isFocused ? focusShadow : 'inset 0 0 0 1px rgba(var(--center-channel-color-rgb), 0.24)',
                },
            });
        },
        indicatorSeparator: (): CSSPropertiesWithPseudos => ({
            display: 'none',
        }),
        indicatorsContainer: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            padding: '2px',
        }),
        dropdownIndicator: (provided: CSSProperties, state: ControlProps<ChannelOption>): CSSPropertiesWithPseudos => ({
            ...provided,
            transform: state.isFocused ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 250ms ease-in-out',
        }),
        valueContainer: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            overflow: 'visible',
        }),
        menu: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            padding: 0,
        }),
        menuList: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            padding: 0,
            backgroundColor: 'var(--center-channel-bg)',
            borderRadius: '4px',
            border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',

            /* Elevation 4 */
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        }),
        groupHeading: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            cursor: 'default',
            position: 'relative',
            display: 'flex',
            height: '2.8rem',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 0 0 2rem',
            margin: 0,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
            backgroundColor: 'none',
            fontSize: '1.2rem',
            fontWeight: 600,
            textTransform: 'uppercase',
        }),
        singleValue: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            maxWidth: 'calc(100% - 10px)',
            width: '100%',
            overflow: 'visible',
        }),
        option: (provided: CSSProperties, state: ControlProps<ChannelOption>): CSSPropertiesWithPseudos => ({
            ...provided,
            cursor: 'pointer',
            padding: '8px 20px',
            backgroundColor: state.isFocused ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'transparent',
        }),
        menuPortalTarget: (provided: CSSProperties): CSSPropertiesWithPseudos => ({
            ...provided,
            zIndex: 999999,
        }),
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
