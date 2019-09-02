// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import XRegExp from 'xregexp';

import {getSuggestionsSplitBy, getSuggestionsSplitByMultiple} from 'mattermost-redux/utils/user_utils';

import {Constants} from 'utils/constants.jsx';

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
    }

    // setProps gives the provider additional context for matching pretexts. Ideally this would
    // just be something akin to a connected component with access to the store itself.
    setProps({currentUserId, profilesInChannel, profilesNotInChannel, autocompleteUsersInChannel}) {
        this.currentUserId = currentUserId;
        this.profilesInChannel = profilesInChannel;
        this.profilesNotInChannel = profilesNotInChannel;
        this.autocompleteUsersInChannel = autocompleteUsersInChannel;
    }

    // specialMentions matches one of @here, @channel or @all, unless using /msg.
    specialMentions() {
        if (this.latestPrefix.startsWith('/msg')) {
            return [];
        }

        return ['here', 'channel', 'all'].filter((item) =>
            item.startsWith(this.latestPrefix)
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

        return profileSuggestions;
    }

    // filterProfile constrains profiles to those matching the latest prefix.
    filterProfile(profile) {
        if (!profile) {
            return false;
        }

        if (profile.id === this.currentUserId) {
            return false;
        }

        const prefixLower = this.latestPrefix.toLowerCase();
        const profileSuggestions = this.getProfileSuggestions(profile);

        return profileSuggestions.some((suggestion) => suggestion.startsWith(prefixLower));
    }

    // localMembers matches up to 25 local results from the store before the server has responded.
    localMembers() {
        const localMembers = this.profilesInChannel.
            filter((profile) => this.filterProfile(profile)).
            map((profile) => ({
                type: Constants.MENTION_MEMBERS,
                ...profile,
            })).
            sort((a, b) => a.username.localeCompare(b.username)).
            splice(0, 25);

        return localMembers;
    }

    // remoteMembers matches the users listed in the channel by the server.
    remoteMembers() {
        if (!this.data) {
            return [];
        }

        return (this.data.users || []).
            filter((profile) => this.filterProfile(profile)).
            map((profile) => ({
                type: Constants.MENTION_MEMBERS,
                ...profile,
            }));
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

    users() {
        const specialMentions = this.specialMentions();

        const localMembers = this.localMembers();

        const localUserIds = {};
        localMembers.forEach((item) => {
            localUserIds[item.id] = true;
        });

        const remoteMembers = this.remoteMembers().filter((item) => !localUserIds[item.id]);

        // Combine the local and remote members, sorting to mix the results together.
        const localAndRemoteMembers = localMembers.concat(remoteMembers).sort((a, b) =>
            a.username.localeCompare(b.username)
        );

        const remoteNonMembers = this.remoteNonMembers().filter((item) => !localUserIds[item.id]);

        return localAndRemoteMembers.concat(specialMentions).concat(remoteNonMembers);
    }

    // updateMatches invokes the resultCallback with the metadata for rendering at mentions
    updateMatches(resultCallback, users) {
        const mentions = users.map((user) => {
            if (user.username) {
                return '@' + user.username;
            }
            return '';
        });

        resultCallback({
            matchedPretext: `@${this.latestPrefix}`,
            terms: mentions,
            items: users,
            component: AtMentionSuggestion,
        });
    }

    handlePretextChanged(pretext, resultCallback) {
        const captured = XRegExp.cache('(?:^|\\W)@([\\pL\\d\\-_.]*)$', 'i').exec(pretext.toLowerCase());
        if (!captured) {
            return false;
        }

        const prefix = captured[1];

        this.startNewRequest(prefix);
        this.updateMatches(resultCallback, this.users());

        // If we haven't gotten server-side results in 500 ms, add the loading indicator.
        let showLoadingIndicator = setTimeout(() => {
            if (this.shouldCancelDispatch(prefix)) {
                return;
            }

            this.updateMatches(resultCallback, this.users().concat([{
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
            this.updateMatches(resultCallback, this.users());
        });

        return true;
    }
}
