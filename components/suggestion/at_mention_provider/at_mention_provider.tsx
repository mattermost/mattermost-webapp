// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import XRegExp from 'xregexp';

import {getSuggestionsSplitBy, getSuggestionsSplitByMultiple} from 'mattermost-redux/utils/user_utils';

import {Constants} from 'utils/constants';

import Provider, {ResultCallbackParams} from '../provider';

import {UserProfile, UserProfileWithLastViewAt} from 'mattermost-redux/types/users';

import {Group} from 'mattermost-redux/types/groups';

import AtMentionSuggestion from './at_mention_suggestion';

interface Props {
    currentUserId: string;
    profilesInChannel: UserProfileWithLastViewAt[];
    autocompleteUsersInChannel: (prefix: string) => Promise<UserProfile[]>;
    useChannelMentions: boolean;
    autocompleteGroups: Group[];
    searchAssociatedGroupsForReference: (prefix: string) => Promise<{data: Group[]}>;
    priorityProfiles: UserProfileWithLastViewAt[];
}

export interface LocalMember extends UserProfileWithLastViewAt {
    type: string;
    isCurrentUser?: boolean;
}

export interface LocalGroup extends Group {
    type: string;
}

export interface SpecialMention {
    username: string;
    type: string;
}

export type Item = LocalMember & LocalGroup & SpecialMention;

// The AtMentionProvider provides matches for at mentions, including @here, @channel, @all,
// users in the channel and users not in the channel. It mixes together results from the local
// store with results fetch from the server.
export default class AtMentionProvider extends Provider {
    data: any;
    lastCompletedWord: string;
    lastPrefixWithNoResults: string;
    triggerCharacter: string;

    currentUserId: string;
    profilesInChannel: UserProfileWithLastViewAt[];
    autocompleteUsersInChannel: (prefix: string) => Promise<UserProfile[]>;
    useChannelMentions: boolean;
    autocompleteGroups: Group[];
    searchAssociatedGroupsForReference: (prefix: string) => Promise<{data: Group[]}>;
    priorityProfiles: UserProfile[];

    constructor(props: Props) {
        super();

        this.data = null;
        this.lastCompletedWord = '';
        this.lastPrefixWithNoResults = '';
        this.triggerCharacter = '@';

        // Give the provider additional context for matching pretexts. Ideally this would
        // just be something akin to a connected component with access to the store itself.
        this.currentUserId = props.currentUserId;
        this.profilesInChannel = props.profilesInChannel;
        this.autocompleteUsersInChannel = props.autocompleteUsersInChannel;
        this.useChannelMentions = props.useChannelMentions;
        this.autocompleteGroups = props.autocompleteGroups;
        this.searchAssociatedGroupsForReference = props.searchAssociatedGroupsForReference;
        this.priorityProfiles = props.priorityProfiles;
    }

    // specialMentions matches one of @here, @channel or @all, unless using /msg.
    specialMentions(): SpecialMention[] {
        if (this.latestPrefix.startsWith('/msg') || !this.useChannelMentions) {
            return [];
        }

        return ['here', 'channel', 'all'].filter((item) =>
            item.startsWith(this.latestPrefix),
        ).map((name) => ({
            username: name,
            type: Constants.MENTION_SPECIAL,
        }));
    }

    // retrieves the parts of the profile that should be checked
    // against the term
    getProfileSuggestions(profile: UserProfileWithLastViewAt | UserProfile): string [] {
        const profileSuggestions: string[] = [];
        if (!profile) {
            return profileSuggestions;
        }

        if (profile.username) {
            const usernameSuggestions = getSuggestionsSplitByMultiple(profile.username.toLowerCase(), Constants.AUTOCOMPLETE_SPLIT_CHARACTERS);
            profileSuggestions.push(...usernameSuggestions);
        }
        [profile.first_name, profile.last_name, profile.nickname].forEach((property) => {
            const suggestions = getSuggestionsSplitBy(property.toLowerCase(), ' ');
            profileSuggestions.push(...suggestions);
        });
        profileSuggestions.push(profile.first_name.toLowerCase() + ' ' + profile.last_name.toLowerCase());

        return profileSuggestions;
    }

    // retrieves the parts of the group mention that should be checked
    // against the term
    getGroupSuggestions(group: Group): string[] {
        const groupSuggestions: string[] = [];
        if (!group) {
            return groupSuggestions;
        }

        if (group.name) {
            const groupnameSuggestions = getSuggestionsSplitByMultiple(group.name.toLowerCase(), Constants.AUTOCOMPLETE_SPLIT_CHARACTERS);
            groupSuggestions.push(...groupnameSuggestions);
        }

        const suggestions = getSuggestionsSplitBy(group.display_name.toLowerCase(), ' ');
        groupSuggestions.push(...suggestions);

        groupSuggestions.push(group.display_name.toLowerCase());
        return groupSuggestions;
    }

    // filterProfile constrains profiles to those matching the latest prefix.
    filterProfile(profile: UserProfileWithLastViewAt | UserProfile): boolean {
        if (!profile) {
            return false;
        }

        const prefixLower = this.latestPrefix.toLowerCase();
        const profileSuggestions = this.getProfileSuggestions(profile);
        return profileSuggestions.some((suggestion) => suggestion.startsWith(prefixLower));
    }

    // filterGroup constrains group mentions to those matching the latest prefix.
    filterGroup(group: Group): boolean {
        if (!group) {
            return false;
        }

        const prefixLower = this.latestPrefix.toLowerCase();
        const groupSuggestions = this.getGroupSuggestions(group);
        return groupSuggestions.some((suggestion) => suggestion.startsWith(prefixLower));
    }

    // localMembers matches up to 25 local results from the store before the server has responded.
    localMembers(): LocalMember[] {
        return this.profilesInChannel.
            filter((profile) => this.filterProfile(profile)).
            map((profile) => this.createFromProfile(profile, Constants.MENTION_MEMBERS)).
            splice(0, 25);
    }

    filterPriorityProfiles(): LocalMember[] {
        if (!this.priorityProfiles) {
            return [];
        }

        return this.priorityProfiles.
            filter((profile) => this.filterProfile(profile)).
            map((profile) => this.createFromProfile(profile, Constants.MENTION_MEMBERS));
    }

    // localGroups matches up to 25 local results from the store
    localGroups(): LocalGroup[] {
        if (!this.autocompleteGroups) {
            return [];
        }

        return this.autocompleteGroups.
            filter((group) => this.filterGroup(group)).
            map((group) => this.createFromGroup(group, Constants.MENTION_GROUPS)).
            sort((a, b) => a.name.localeCompare(b.name)).
            splice(0, 25);
    }

    // remoteMembers matches the users listed in the channel by the server.
    remoteMembers(): LocalMember[] {
        if (!this.data) {
            return [];
        }

        return (this.data.users || []).
            filter((profile: UserProfileWithLastViewAt) => this.filterProfile(profile)).
            map((profile: UserProfileWithLastViewAt) => this.createFromProfile(profile, Constants.MENTION_MEMBERS));
    }

    // remoteGroups matches the users listed in the channel by the server.
    remoteGroups(): LocalGroup[] {
        if (!this.data) {
            return [];
        }
        return (this.data.groups || []).
            filter((group: Group) => this.filterGroup(group)).
            map((group: Group) => this.createFromGroup(group, Constants.MENTION_GROUPS));
    }

    // remoteNonMembers matches users listed as not in the channel by the server.
    // listed in the channel from local results.
    remoteNonMembers(): LocalMember[] {
        if (!this.data) {
            return [];
        }

        return (this.data.out_of_channel || []).
            filter((profile: UserProfileWithLastViewAt) => this.filterProfile(profile)).
            map((profile: UserProfileWithLastViewAt) => this.createFromProfile(profile, Constants.MENTION_NONMEMBERS));
    }

    items(): Item[] {
        const priorityProfilesIds: Record<string, boolean> = {};
        const priorityProfiles = this.filterPriorityProfiles();

        priorityProfiles.forEach((member) => {
            priorityProfilesIds[member.id] = true;
        });

        const specialMentions = this.specialMentions();
        const localMembers = this.localMembers().filter((member) => !priorityProfilesIds[member.id]);

        const localUserIds: Record<string, boolean> = {};

        localMembers.forEach((member) => {
            localUserIds[member.id] = true;
        });

        const remoteMembers = this.remoteMembers().filter((member) => !localUserIds[member.id] && !priorityProfilesIds[member.id]);

        // comparator which prioritises users with usernames starting with search term
        const orderUsers = (a: LocalMember, b: LocalMember) => {
            const aStartsWith = a.username.startsWith(this.latestPrefix);
            const bStartsWith = b.username.startsWith(this.latestPrefix);

            if (aStartsWith && !bStartsWith) {
                return -1;
            } else if (!aStartsWith && bStartsWith) {
                return 1;
            }

            // Sort recently viewed channels first
            if (a.last_viewed_at && b.last_viewed_at) {
                return b.last_viewed_at - a.last_viewed_at;
            } else if (a.last_viewed_at) {
                return -1;
            } else if (b.last_viewed_at) {
                return 1;
            }

            return a.username.localeCompare(b.username);
        };

        // Combine the local and remote members, sorting to mix the results together.
        const localAndRemoteMembers = localMembers.concat(remoteMembers).sort(orderUsers);

        // handle groups
        const localGroups = this.localGroups();

        const localGroupIds: Record<string, boolean> = {};
        localGroups.forEach((group) => {
            localGroupIds[group.id] = true;
        });

        const remoteGroups = this.remoteGroups().filter((group) => !localGroupIds[group.id]);

        // comparator which prioritises users with usernames starting with search term
        const orderGroups = (a: LocalGroup, b: LocalGroup) => {
            const aStartsWith = a.name.startsWith(this.latestPrefix);
            const bStartsWith = b.name.startsWith(this.latestPrefix);

            if (aStartsWith && bStartsWith) {
                return a.name.localeCompare(b.name);
            }
            if (aStartsWith) {
                return -1;
            }
            if (bStartsWith) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        };

        // Combine the local and remote groups, sorting to mix the results together.
        const localAndRemoteGroups = localGroups.concat(remoteGroups).sort(orderGroups);

        const remoteNonMembers = this.remoteNonMembers().
            filter((member) => !localUserIds[member.id]).
            sort(orderUsers);

        return [
            ...priorityProfiles,
            ...localAndRemoteMembers,
            ...localAndRemoteGroups,
            ...specialMentions,
            ...remoteNonMembers,
        ].map((item: (LocalMember | LocalGroup | SpecialMention)) => item as Item);
    }

    // updateMatches invokes the resultCallback with the metadata for rendering at mentions
    updateMatches(resultCallback: (params: ResultCallbackParams) => void, items: any[]): void {
        if (items.length === 0) {
            this.lastPrefixWithNoResults = this.latestPrefix;
        } else if (this.lastPrefixWithNoResults === this.latestPrefix) {
            this.lastPrefixWithNoResults = '';
        }
        const mentions = items.map((item) => {
            if (item.username) {
                return '@' + item.username;
            } else if (item.name) {
                return '@' + item.name;
            }
            return '';
        });

        resultCallback({
            matchedPretext: `@${this.latestPrefix}`,
            terms: mentions,
            items,
            component: AtMentionSuggestion,
        });
    }

    handlePretextChanged(pretext: string, resultCallback: (params: ResultCallbackParams) => void): boolean {
        const captured = XRegExp.cache('(?:^|\\W)@([\\pL\\d\\-_. ]*)$', 'i').exec(pretext.toLowerCase());
        if (!captured) {
            return false;
        }

        if (this.lastCompletedWord && captured[0].trim().startsWith(this.lastCompletedWord.trim())) {
            // It appears we're still matching a channel handle that we already completed
            return false;
        }

        const prefix = captured[1];
        if (this.lastPrefixWithNoResults && prefix.startsWith(this.lastPrefixWithNoResults)) {
            // Just give up since we know it won't return any results
            return false;
        }

        this.startNewRequest(prefix);
        this.updateMatches(resultCallback, this.items());

        // If we haven't gotten server-side results in 500 ms, add the loading indicator.
        let showLoadingIndicator: NodeJS.Timeout | null = setTimeout(() => {
            if (this.shouldCancelDispatch(prefix)) {
                return;
            }

            this.updateMatches(resultCallback, [...this.items(), {type: Constants.MENTION_MORE_MEMBERS, loading: true}]);

            showLoadingIndicator = null;
        }, 500);

        // Query the server for remote results to add to the local results.
        this.autocompleteUsersInChannel(prefix).then(({data}: any) => {
            if (showLoadingIndicator) {
                clearTimeout(showLoadingIndicator);
            }

            if (this.shouldCancelDispatch(prefix)) {
                return;
            }

            this.data = data;

            this.searchAssociatedGroupsForReference(prefix).then((groupsData) => {
                if (this.data && groupsData && groupsData.data) {
                    this.data.groups = groupsData.data;
                }
                this.updateMatches(resultCallback, this.items());
            });
        });

        return true;
    }

    handleCompleteWord(term: string): void {
        this.lastCompletedWord = term;
        this.lastPrefixWithNoResults = '';
    }

    createFromProfile(profile: UserProfileWithLastViewAt | UserProfile, type: string): LocalMember {
        const localMember: LocalMember = {
            type,
            ...profile,
        };

        if (profile.id === this.currentUserId) {
            localMember.isCurrentUser = true;
        }

        return localMember;
    }

    createFromGroup(group: Group, type: string): LocalGroup {
        return {
            ...group,
            type,
        };
    }
}
