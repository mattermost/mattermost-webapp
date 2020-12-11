// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, ChangeEvent, useState, useEffect, KeyboardEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import './quick_switch_modal.scss';

import {GlobalState} from 'mattermost-redux/types/store';
import {Preferences} from 'mattermost-redux/constants';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {UserProfile} from 'mattermost-redux/types/users';

import {DispatchFunc} from 'mattermost-redux/types/actions';

//import {Channel} from 'mattermost-redux/types/channels';
//import {Client4} from 'mattermost-redux/client';

import Fuse from 'fuse.js';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import Avatar from 'components/widgets/users/avatar';
import {switchToChannelById} from 'actions/views/channel';

import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';
const KeyCodes = Constants.KeyCodes;

import OldQuickSwitchModal from 'components/quick_switch_modal_old';

interface Props {
    onHide: () => void
}

type Suggestion = {
    id: string
    name: string
    display: string
    type: string
    team: string
    archived?: boolean
    lastViewed: number
}

interface ItemProps {
    suggestion: Suggestion
    selected: boolean
}

const fuseOptions = {
    includeScore: true,
    minMatchCharLength: 2,
    distance: 40,
    threshold: 0.5,
    ignoreFieldNorm: true,
    keys: ['display'],
};

function startsWithAny(term: string, startsWith: string[]) {
    return startsWith.reduce((acc, option) => acc || term.toLowerCase().startsWith(option.toLowerCase()), false);
}

function numIncludes(term: string, startsWith: string[]) {
    const result = startsWith.reduce((acc, option) => acc + (term.toLowerCase().includes(option.toLowerCase()) ? 1 : 0), 1);
    return result;
}

function makeSuggestionSorter(term: string) {
    return (optionA: Fuse.FuseResult<Suggestion>, optionB: Fuse.FuseResult<Suggestion>) => {
        const optionAIncludes = numIncludes(optionA.item.display, term.split(' '));
        const optionBIncludes = numIncludes(optionB.item.display, term.split(' '));
        if (optionAIncludes !== optionBIncludes) {
            return (optionAIncludes > optionBIncludes) ? -1 : 1;
        }
        if (optionA.score?.toFixed(2) === optionB.score?.toFixed(2)) {
            const optionAStartsWith = startsWithAny(optionA.item.display, term.split(' '));
            const optionBStartsWith = startsWithAny(optionB.item.display, term.split(' '));
            if (optionAStartsWith && !optionBStartsWith) {
                return -1;
            } else if (!optionAStartsWith && optionBStartsWith) {
                return 1;
            }

            if (optionA.item.type !== 'G' && optionB.item.type === 'G') {
                return -1;
            }
            if (optionA.item.type === 'G' && optionB.item.type !== 'G') {
                return 1;
            }

            if (optionA.item.lastViewed !== optionB.item.lastViewed) {
                return optionA.item.lastViewed > optionB.item.lastViewed ? -1 : 1;
            }
        }

        if (optionA.score === optionB.score) {
            return optionA.refIndex < optionB.refIndex ? -1 : 1;
        }
        return optionA.score < optionB.score ? -1 : 1;
    };
}

function getDisplayNameForDMChannel(user: UserProfile, teammateNameDisplay: string | undefined) {
    let displayName;

    if (!user) {
        return 'Unknown User';
    }

    // The naming format is fullname - @username (nickname) if DISPLAY_PREFER_FULL_NAME is set.
    // Otherwise, it's @username - fullname (nickname)
    if (teammateNameDisplay === Preferences.DISPLAY_PREFER_FULL_NAME) {
        if ((user.first_name || user.last_name) && user.nickname) {
            displayName = `${Utils.getFullName(user)} - @${user.username} (${user.nickname})`;
        } else if (user.nickname) {
            displayName = `@${user.username} - (${user.nickname})`;
        } else if (user.first_name || user.last_name) {
            displayName = `${Utils.getFullName(user)} - @${user.username}`;
        } else {
            displayName = `@${user.username}`;
        }
    } else {
        displayName = `@${user.username}`;
        if ((user.first_name || user.last_name) && user.nickname) {
            displayName += ` - ${Utils.getFullName(user)} (${user.nickname})`;
        } else if (user.nickname) {
            displayName += ` - (${user.nickname})`;
        } else if (user.first_name || user.last_name) {
            displayName += ` - ${Utils.getFullName(user)}`;
        }
    }

    if (user.delete_at) {
        displayName += ' - ' + Utils.localizeMessage('channel_switch_modal.deactivated', 'Deactivated');
    }

    return displayName;
}

function channelListSelector(state: GlobalState) {
    const currentlyLoadedChannels = state.entities.channels.channels;
    const values = Object.values(currentlyLoadedChannels).map((channel) => {
        let display = channel.display_name;
        let team = getTeam(state, channel.team_id)?.display_name;
        const memberships = getMyChannelMemberships(state);
        let archived = channel.delete_at !== 0;
        if (channel.type === 'D') {
            const user = state.entities.users.profiles[Utils.getUserIdFromChannelId(channel.name)];
            display = getDisplayNameForDMChannel(user, getTeammateNameDisplaySetting(state));
            team = '';
            archived = user?.delete_at !== 0;
        }
        return {
            id: channel.id,
            name: channel.name,
            display,
            type: channel.type,
            team,
            archived,
            lastViewed: memberships[channel.id]?.last_viewed_at || 0,
        };
    });

    return [new Fuse<Suggestion>(values, fuseOptions), values];
}

/*async function fetchOtherChannels(searchTerm: string, localdata, memberships, teamId) {
    const usersAsync = Client4.autocompleteUsers(searchTerm, '', '');
    const channelsAsync = Client4.searchChannels(teamId, searchTerm);

    const users = (await usersAsync).users;
    const channels = await channelsAsync;

    const dedupedChannels = channels.filter((channel: Channel) => !memberships[channel.id]).map((channel: Channel) => {
        return {
            id: channel.id,
            name: channel.name,
            display: channel.display_name,
            type: channel.type,
            team: 'temptest',
        };
    });

    return new Fuse(dedupedChannels, {
        minMatchCharLength: 2,
        distance: 26,
        keys: ['display'],
    }).search(searchTerm, {limit: 5}).map((result) => result.item);
}*/

const SuggestionItem: FC<ItemProps> = (props: ItemProps) => {
    let icon = null;
    const text = props.suggestion.display;
    switch (props.suggestion.type) {
    case 'O':
        icon = <i className={'icon-globe'}/>;
        break;
    case 'P':
        icon = <i className={'icon-lock-outline'}/>;
        break;
    case 'D': {
        const userid = Utils.getUserIdFromChannelId(props.suggestion.name);
        const userImageUrl = Utils.imageURLForUser(userid, 0);
        icon = (
            <Avatar
                className={'QuickSwitchModal__avatar'}
                size='sm'
                url={userImageUrl}
            />
        );
    }
        break;
    case 'G':
        icon = <i className={'icon-folder-outline'}/>;
        break;
    }

    if (props.suggestion.archived && props.suggestion.type !== 'D') {
        icon = <i className={'icon-archive-outline'}/>;
    }

    return (
        <div
            className={'QuickSwitchModal__itemrow ' + (props.selected ? 'selected' : '')}
        >
            {icon}
            <div className={'QuickSwitchModal__channel'}>
                {text}
            </div>
            <div className={'QuickSwitchModal__team'}>
                {props.suggestion.team}
            </div>
        </div>
    );
};

const QuickSwitchModal: FC<Props> = (props: Props) => {
    const dispatch = useDispatch<DispatchFunc>();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestionList, setSuggestionList] = useState<Suggestion[]>([]);
    const [archivedList, setArchivedList] = useState<Suggestion[]>([]);

    //const [moreChannelsList, setMoreChannelsList] = useState<Suggestion[]>([]);
    const [selectedItem, setSelectedItem] = useState<number>(0);
    const [searcher] = useSelector(channelListSelector);

    //const currentTeamId = useSelector(getCurrentTeamId);
    //const memberships = useSelector(getMyChannelMemberships);

    useEffect(() => {
        let results = searcher.search(searchTerm, {limit: 20}).sort(makeSuggestionSorter(searchTerm));
        results = results.map((result: Fuse.FuseResult<Suggestion>) => result.item);
        let regularSuggestions = results.filter((suggestion: Suggestion) => !suggestion.archived);
        let archivedSuggestions = results.filter((suggestion: Suggestion) => suggestion.archived);
        regularSuggestions = regularSuggestions.slice(0, 9);
        archivedSuggestions = archivedSuggestions.slice(0, 3);
        setSuggestionList(regularSuggestions);
        setArchivedList(archivedSuggestions);

        /*if (searchTerm !== '') {
            fetchOtherChannels(searchTerm, rawList, memberships, currentTeamId).then((value) => {
                setMoreChannelsList(value);
                });
                }*/
        setSelectedItem(0);
    }, [searchTerm]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (Utils.isKeyPressed(e, KeyCodes.UP)) {
            if (selectedItem > 0) {
                setSelectedItem(selectedItem - 1);
            }
            e.preventDefault();
        } else if (Utils.isKeyPressed(e, KeyCodes.DOWN) || (e.ctrlKey && Utils.isKeyPressed(e, KeyCodes.J))) {
            if (selectedItem <= suggestionList.length) {
                setSelectedItem(selectedItem + 1);
            }
            e.preventDefault();
        } else if (Utils.isKeyPressed(e, KeyCodes.ENTER)) {
            e.preventDefault();
            if (suggestionList.length <= 0) {
                return;
            }

            const selectedChannel = suggestionList[selectedItem];
            dispatch(switchToChannelById(selectedChannel.id)).then(props.onHide);
        } else if (Utils.isKeyPressed(e, KeyCodes.ESCAPE)) {
            e.preventDefault();
            props.onHide();
        }
    };

    return (
        <>
            <div
                className='QuickSwitchModal__background'
                onClick={props.onHide}
            />
            <div className='QuickSwitchModal'>
                <div className='QuickSwitchModal__header'>
                    <i
                        className='icon-magnify'
                    />
                    <input
                        value={searchTerm}
                        type='text'
                        autoComplete='off'
                        spellCheck={false}
                        autoFocus={true}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        placeholder={'What are you looking for...'}
                        onKeyDown={handleKeyDown}
                    />
                    <i
                        className='icon-close'
                        onClick={props.onHide}
                    />
                </div>
                {suggestionList.map((item: Suggestion, index: number) => {
                    return (
                        <SuggestionItem
                            key={item.id}
                            suggestion={item}
                            selected={selectedItem === index}
                        />
                    );
                })}
                {/*moreChannelsList.length > 0 ?
                    <div className={'QuickSwitchModal__divider'}>
                        {'Not In Channel'}
                    </div> : null
                  */}
                {/*moreChannelsList.map((item: Suggestion, index: number) => {
                    return (
                        <SuggestionItem
                            key={item.id}
                            suggestion={item}
                            selected={selectedItem === index + suggestionList.length}
                        />
                    );
                    })*/}
                {archivedList.length > 0 ?
                    <div className={'QuickSwitchModal__divider'}>
                        {'Archived'}
                    </div> : null
                }
                {archivedList.map((item: Suggestion, index: number) => {
                    return (
                        <SuggestionItem
                            key={item.id}
                            suggestion={item}
                            selected={selectedItem === index + suggestionList.length}
                        />
                    );
                })}
            </div>
        </>
    );
};

const QuickSwitchModalSwitcher: FC<Props> = (props: Props) => {
    const config = useSelector(getConfig) as Record<string, string>;

    if (true || config.FeatureFlagNewQuickSwitcher === 'true') {
        return <QuickSwitchModal {...props}/>;
    }

    return <OldQuickSwitchModal {...props}/>;
};

export default QuickSwitchModalSwitcher;
