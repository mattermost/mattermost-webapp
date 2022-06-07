// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';

import React, {useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import {ValueType} from 'react-select';
import {Props as AsyncSelectProps} from 'react-select/src/Async';
import {
    ArchiveOutlineIcon,
    GlobeIcon,
    LockOutlineIcon,
    MessageTextOutlineIcon,
} from '@mattermost/compass-icons/components';

import {getMyTeams, getTeam} from 'mattermost-redux/selectors/entities/teams';

import {isGuest} from 'mattermost-redux/utils/user_utils';

import {getCurrentUserId, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from '@mattermost/types/store';

import {getUser, getUserByUsername} from 'mattermost-redux/selectors/entities/users';

const AsyncSelect = require('react-select/lib/Async').default as React.ElementType<AsyncSelectProps<ChannelOption>>; // eslint-disable-line global-require

import {Post} from '@mattermost/types/posts';

import {Channel} from 'mattermost-redux/types/channels';
import {ActionResult} from 'mattermost-redux/types/actions';

import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';

import './forward_post_modal.scss';
import Constants from '../../utils/constants';
import * as Utils from '../../utils/utils';
import CustomStatusEmoji from '../custom_status/custom_status_emoji';
import ProfilePicture from '../profile_picture';
import SharedChannelIndicator from '../shared_channel_indicator';
import Suggestion from '../suggestion/suggestion';
import BotBadge from '../widgets/badges/bot_badge';
import GuestBadge from '../widgets/badges/guest_badge';

// import Textbox from 'components/textbox';

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

    /**
     * The function called immediately after the modal is hidden
     */
    onExited?: () => void;

    post: Post;

    isMobileView: boolean;

    actions: {
        joinChannelById: (channelId: string) => Promise<ActionResult>;
        switchToChannel: (channel: Channel) => Promise<ActionResult>;
    };
}

type GroupedOption = {
    label: string | React.ReactElement;
    options: ChannelOption[];
}

const FormattedOption = (channel: ChannelOption) => {
    const {details} = channel;

    const currentUserId = useSelector((state: GlobalState) => getCurrentUserId(state));
    const user = useSelector((state: GlobalState) => getUser(state, details.id));
    console.log('##### details', details);
    const teammate = useSelector((state: GlobalState) => getDirectTeammate(state, details.id));
    const team = useSelector((state: GlobalState) => getTeam(state, details.team_id));
    const userImageUrl = user?.id && Utils.imageURLForUser(user.id, user.last_picture_update);
    const isPartOfOnlyOneTeam = useSelector((state: GlobalState) => getMyTeams(state).length === 1);

    const channelIsArchived = details.delete_at && details.delete_at !== 0;

    let icon;
    const iconProps = {
        size: 16,
        color: 'currentColor',
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
        icon = (
            <span className='suggestion-list__icon suggestion-list__icon--large'>
                <div className='status status--group'>{'G'}</div>
            </span>
        );
    } else {
        icon = (
            <ProfilePicture
                src={userImageUrl}
                status={teammate && teammate.is_bot ? undefined : status}
                size='sm'
            />
        );
    }

    let tag = null;
    let customStatus = null;

    let name = details.display_name;
    let description = `~${details.name}`;
    let deactivated = '';

    if (details.type === Constants.DM_CHANNEL) {
        tag = (
            <React.Fragment>
                <BotBadge
                    show={Boolean(teammate && teammate.is_bot)}
                    className='badge-autocomplete'
                />
                <GuestBadge
                    show={Boolean(teammate && isGuest(teammate.roles))}
                    className='badge-autocomplete'
                />
            </React.Fragment>
        );

        customStatus = (
            <CustomStatusEmoji
                showTooltip={true}
                userID={user.id}
                emojiStyle={{
                    marginBottom: 2,
                    marginLeft: 8,
                }}
            />
        );

        if (user.delete_at) {
            deactivated = (' - ' + Utils.localizeMessage('channel_switch_modal.deactivated', 'Deactivated'));
        }

        if (details.display_name && !(teammate && teammate.is_bot)) {
            description = `@${user.username}${deactivated}`;
        } else {
            name = user.username;
            if (user.id === currentUserId) {
                name += ` ${Utils.localizeMessage('suggestion.user.isCurrent', '(you)')}`;
            }
            description = deactivated;
        }
    } else if (details.type === Constants.GM_CHANNEL) {
        // remove the slug from the option
        name = details.display_name;
        description = '';
    }

    let sharedIcon = null;
    if (details.shared) {
        sharedIcon = (
            <SharedChannelIndicator
                className='shared-channel-icon'
                channelType={details.type}
            />
        );
    }

    let teamName = null;
    if (details.team_id && team) {
        teamName = (<span className='ml-2 suggestion-list__team-name'>{team.display_name}</span>);
    }

    return (
        <div
            id={`post-forward_channel-select_${details.name}`}
            data-testid={details.name}
            aria-label={name}
        >
            {icon}
            <div className='suggestion-list__ellipsis suggestion-list__flex'>
                <span className='suggestion-list__main'>
                    <span>{name}</span>
                    {(isPartOfOnlyOneTeam || details.type === Constants.DM_CHANNEL) && (
                        <span className='ml-2 suggestion-list__desc'>{description}</span>
                    )}
                </span>
                {customStatus}
                {sharedIcon}
                {tag}
                {!isPartOfOnlyOneTeam && teamName}
            </div>
        </div>
    );
};

const ForwardPostModal = (props: Props) => {
    const [comment, setComment] = useState('Comment goes HERE!');
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

    const header = (
        <h1>
            <FormattedMessage
                id='quick_switch_modal.switchChannels'
                defaultMessage='Find Channels'
            />
        </h1>
    );

    const help = 'this is where the help-text goes';

    const formatOptionLabel = (channel: ChannelOption) => (
        <FormattedOption {...channel}/>
    );

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
            />
            <Modal.Body>
                <div className='forward-post__header'>
                    {header}
                    <div
                        className='forward-post__hint'
                        id='forwardPostModalHint'
                    >
                        {help}
                    </div>
                </div>
                <div className='forward-post__suggestion-box'>
                    <i className='icon icon-magnify icon-16'/>
                    <AsyncSelect
                        value={selectedChannel}
                        onChange={handleChannelSelect}
                        loadOptions={handleInputChange}
                        defaultOptions={defaultOptions.current}
                        formatOptionLabel={formatOptionLabel}
                        isMenuOpen={true}
                        legend={'Forrward to'}
                        placeholder={'Select a channel or people'}
                    />
                </div>
                <div className='forward-post__comment-box'>
                    {comment}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ForwardPostModal;
