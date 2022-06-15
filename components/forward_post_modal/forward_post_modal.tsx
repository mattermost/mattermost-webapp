// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties, useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import * as CSS from 'csstype';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {ValueType, ControlProps, components, IndicatorProps} from 'react-select';
import {Props as AsyncSelectProps} from 'react-select/src/Async';
import {
    ArchiveOutlineIcon, ChevronDownIcon,
    GlobeIcon,
    LockOutlineIcon,
    MessageTextOutlineIcon,
} from '@mattermost/compass-icons/components';

import {getMyTeams, getTeam} from 'mattermost-redux/selectors/entities/teams';

import {isGuest} from 'mattermost-redux/utils/user_utils';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from '@mattermost/types/store';

import {getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';

const AsyncSelect = require('react-select/lib/Async').default as React.ElementType<AsyncSelectProps<ChannelOption>>; // eslint-disable-line global-require

import {Post} from '@mattermost/types/posts';

import {Channel} from 'mattermost-redux/types/channels';

import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';
import SharedChannelIndicator from 'components/shared_channel_indicator';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import ProfilePicture from 'components/profile_picture';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';

import './forward_post_modal.scss';

// import Textbox from 'components/textbox';

type CSSPropertiesWithPseudos = CSSProperties & { [P in CSS.SimplePseudos]?: CSS.Properties };

type ProviderResults = {
    matchedPretext: string;
    terms: string[];

    // The providers currently do not provide a clearly defined type and structure
    items: Array<Record<string, any>>;
    component?: React.ReactNode;
}

type ChannelOption = {
    label: string;
    value: string;
    details: Channel;
}

export type Props = {

    // The function called immediately after the modal is hidden
    onExited?: () => void;

    // the post that should being forwarded
    post: Post;

    // determines if the viewport currently falls into the mobile view-range
    isMobileView: boolean;

    actions: {
    };
}

type GroupedOption = {
    label: string | React.ReactElement;
    options: ChannelOption[];
}

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

const FormattedOption = (channel: ChannelOption) => {
    const {details} = channel;

    const {formatMessage} = useIntl();

    const currentUserId = useSelector((state: GlobalState) => getCurrentUserId(state));
    const user = useSelector((state: GlobalState) => getUser(state, details.userId));
    const status = useSelector((state: GlobalState) => getStatusForUserId(state, details.userId));
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

const ForwardPostModal = (props: Props) => {
    const [comment] = useState('Comment goes HERE!');
    const {current: provider} = useRef<SwitchChannelProvider>(new SwitchChannelProvider());
    const [selectedChannel, setSelectedChannel] = useState<ValueType<ChannelOption>>();

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

    const onHide = () => {
        // focusPostTextbox();
        props.onExited?.();
    };

    const handleChannelSelect = (channel: ValueType<ChannelOption>) => {
        setSelectedChannel(channel);
    };

    const formatOptionLabel = (channel: ChannelOption) => {
        return (
            <FormattedOption {...channel}/>
        );
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
    };

    return (
        <Modal
            dialogClassName='a11y__modal forward-post'
            show={true}
            onHide={onHide}
            enforceFocus={false}
            restoreFocus={false}
            role='dialog'
            aria-labelledby='forwardPostModalLabel'
            aria-describedby='forwardPostModalHint'
            animation={true}
        >
            <Modal.Header
                id='forwardPostModalLabel'
                closeButton={true}
            >
                <Modal.Title
                    componentClass='h1'
                    id='forwardPostModalTitle'
                >
                    <FormattedMessage
                        id='forward_post_modal.title'
                        defaultMessage='Forward Message'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AsyncSelect
                    value={selectedChannel}
                    onChange={handleChannelSelect}
                    loadOptions={handleInputChange}
                    defaultOptions={defaultOptions.current}
                    formatOptionLabel={formatOptionLabel}
                    components={{DropdownIndicator}}
                    styles={baseStyles}
                    legend='Forrward to'
                    placeholder='Select channel or people'
                    className='forward-post__select'
                />
                <div className='forward-post__comment-box'>
                    {comment}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ForwardPostModal;
