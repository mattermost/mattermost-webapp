// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import XRegExp from 'xregexp';

import {getSuggestionsSplitBy, getSuggestionsSplitByMultiple} from 'mattermost-redux/utils/user_utils';

import {Constants} from 'utils/constants';

import Provider from '../provider.jsx';

import AtMentionSuggestion from './at_mention_suggestion.jsx';

// The AtMentionProvider provides matches for at mentions, including @here, @channel, @all,
// users in the channel and users not in the channel. It mixes together results from the local
// store with results fetch from the server.
export default class AtMentionProvider extends Provider {
    constructor(props) {
        super();

        this.setProps(props);

        this.data = null;
        this.lastCompletedWord = '';
        this.lastPrefixWithNoResults = '';
    }

    // setProps gives the provider additional context for matching pretexts. Ideally this would
    // just be something akin to a connected component with access to the store itself.
    setProps({currentUserId, profilesInChannel, profilesNotInChannel, autocompleteUsersInChannel, useChannelMentions, autocompleteGroups, searchAssociatedGroupsForReference}) {
        this.currentUserId = currentUserId;
        this.profilesInChannel = profilesInChannel;
        this.profilesNotInChannel = profilesNotInChannel;
        this.autocompleteUsersInChannel = autocompleteUsersInChannel;
        this.useChannelMentions = useChannelMentions;
        this.autocompleteGroups = autocompleteGroups;
        this.searchAssociatedGroupsForReference = searchAssociatedGroupsForReference;
    }

    // specialMentions matches one of @here, @channel or @all, unless using /msg.
    specialMentions() {
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
    getProfileSuggestions(profile) {
        const profileSuggestions = [];
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
    getGroupSuggestions(group) {
        const groupSuggestions = [];
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
    filterProfile(profile) {
        if (!profile) {
            return false;
        }

        const prefixLower = this.latestPrefix.toLowerCase();
        const profileSuggestions = this.getProfileSuggestions(profile);
        return profileSuggestions.some((suggestion) => suggestion.startsWith(prefixLower));
    }

    // filterGroup constrains group mentions to those matching the latest prefix.
    filterGroup(group) {
        if (!group) {
            return false;
        }

        const prefixLower = this.latestPrefix.toLowerCase();
        const groupSuggestions = this.getGroupSuggestions(group);
        return groupSuggestions.some((suggestion) => suggestion.startsWith(prefixLower));
    }

    // localMembers matches up to 25 local results from the store before the server has responded.
    localMembers() {
        const localMembers = this.profilesInChannel.
            filter((profile) => this.filterProfile(profile)).
            map((profile) => this.createFromProfile(profile, Constants.MENTION_MEMBERS)).
            sort((a, b) => a.username.localeCompare(b.username)).
            splice(0, 25);

        return localMembers;
    }

    // localGroups matches up to 25 local results from the store
    localGroups() {
        const localGroups = this.autocompleteGroups.
            filter((group) => this.filterGroup(group)).
            map((group) => this.createFromGroup(group, Constants.MENTION_GROUPS)).
            sort((a, b) => a.name.localeCompare(b.name)).
            splice(0, 25);

        return localGroups;
    }

    // remoteMembers matches the users listed in the channel by the server.
    remoteMembers() {
        if (!this.data) {
            return [];
        }

        const remoteMembers = (this.data.users || []).
            filter((profile) => this.filterProfile(profile)).
            map((profile) => this.createFromProfile(profile, Constants.MENTION_MEMBERS));

        return remoteMembers;
    }

    // remoteGroups matches the users listed in the channel by the server.
    remoteGroups() {
        if (!this.data) {
            return [];
        }
        const remoteGroups = (this.data.groups || []).
            filter((group) => this.filterGroup(group)).
            map((group) => this.createFromGroup(group, Constants.MENTION_GROUPS));

        return remoteGroups;
    }

    // remoteNonMembers matches users listed as not in the channel by the server.
    // listed in the channel from local results.
    remoteNonMembers() {
        if (!this.data) {
            return [];
        }

        return (this.data.out_of_channel || []).
            filter((profile) => this.filterProfile(profile)).
            map((profile) => ({
                type: Constants.MENTION_NONMEMBERS,
                ...profile,
            }));
    }

    items() {
        const specialMentions = this.specialMentions();
        const localMembers = this.localMembers();

        const localUserIds = {};
        localMembers.forEach((member) => {
            localUserIds[member.id] = true;
        });

        const remoteMembers = this.remoteMembers().filter((member) => !localUserIds[member.id]);

        // comparator which prioritises users with usernames starting with search term
        const orderUsers = (a, b) => {
            const aStartsWith = a.username.startsWith(this.latestPrefix);
            const bStartsWith = b.username.startsWith(this.latestPrefix);

            if (aStartsWith && bStartsWith) {
                return a.username.localeCompare(b.username);
            }
            if (aStartsWith) {
                return -1;
            }
            if (bStartsWith) {
                return 1;
            }
            return a.username.localeCompare(b.username);
        };

        // Combine the local and remote members, sorting to mix the results together.
        const localAndRemoteMembers = localMembers.concat(remoteMembers).sort(orderUsers);

        // handle groups
        const localGroups = this.localGroups();

        const localGroupIds = {};
        localGroups.forEach((group) => {
            localGroupIds[group.id] = true;
        });

        const remoteGroups = this.remoteGroups().filter((group) => !localGroupIds[group.id]);

        // comparator which prioritises users with usernames starting with search term
        const orderGroups = (a, b) => {
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

        return localAndRemoteMembers.concat(localAndRemoteGroups).concat(specialMentions).concat(remoteNonMembers);
    }

    // updateMatches invokes the resultCallback with the metadata for rendering at mentions
    updateMatches(resultCallback, items) {
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

    handlePretextChanged(pretext, resultCallback) {
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
        let showLoadingIndicator = setTimeout(() => {
            if (this.shouldCancelDispatch(prefix)) {
                return;
            }

            this.updateMatches(resultCallback, this.items().concat([{
                type: Constants.MENTION_MORE_MEMBERS,
                loading: true,
            }]));

            showLoadingIndicator = null;
        }, 500);

        // Query the server for remote results to add to the local results.
        this.autocompleteUsersInChannel(prefix).then(({data}) => {
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

    handleCompleteWord(term) {
        this.lastCompletedWord = term;
        this.lastPrefixWithNoResults = '';
    }

    createFromProfile(profile, type) {
        if (profile.id === this.currentUserId) {
            return {
                type,
                ...profile,
                isCurrentUser: true,
            };
        }

        return {
            type,
            ...profile,
        };
    }

    createFromGroup(group, type) {
        return {
            type,
            ...group,
        };
    }
}
