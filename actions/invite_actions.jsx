// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TeamActions from 'mattermost-redux/actions/teams';
import {getTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getChannelMembersInChannels} from 'mattermost-redux/selectors/entities/channels';
import {joinChannel} from 'mattermost-redux/actions/channels';

import {addUsersToTeam} from 'actions/team_actions';

import {isGuest, localizeMessage} from 'utils/utils';

export function sendMembersInvites(teamId, users, emails) {
    return async (dispatch, getState) => {
        if (users.length > 0) {
            await dispatch(TeamActions.getTeamMembersByIds(teamId, users.map((u) => u.id)));
        }
        const state = getState();
        const sent = [];
        const notSent = [];
        const usersToAdd = [];
        for (const user of users) {
            const member = getTeamMember(state, teamId, user.id);
            if (isGuest(user)) {
                notSent.push({user, reason: localizeMessage('invite.members.user-is-guest', 'Contact your admin to make this guest a full member.')});
            } else if (member) {
                notSent.push({user, reason: localizeMessage('invite.members.already-member', 'This person is already a team member.')});
            } else {
                usersToAdd.push(user);
            }
        }
        if (usersToAdd.length > 0) {
            let response;
            try {
                response = await dispatch(addUsersToTeam(teamId, usersToAdd.map((u) => u.id)));
            } catch (e) {
                response = {error: localizeMessage('invite.members.unable-to-add-the-user-to-the-team', 'Unable to add the user to the team.')};
            }
            for (const user of usersToAdd) {
                if (response.error) {
                    notSent.push({user, reason: response.error.toString()});
                } else {
                    sent.push({user, reason: localizeMessage('invite.members.added-to-team', 'This member has been added to the team.')});
                }
            }
        }
        if (emails.length > 0) {
            let response;
            try {
                response = await dispatch(TeamActions.sendEmailInvitesToTeam(teamId, emails));
            } catch (e) {
                response = {error: localizeMessage('invite.members.unable-to-add-the-user-to-the-team', 'Unable to add the user to the team.')};
            }
            for (const email of emails) {
                if (response.error) {
                    notSent.push({email, reason: response.error.toString()});
                } else {
                    sent.push({email, reason: localizeMessage('invite.members.invite-sent', 'An invitation email has been sent.')});
                }
            }
        }
        return {sent, notSent};
    };
}

export async function sendGuestInviteForUser(dispatch, user, teamId, channels, members) {
    if (!isGuest(user)) {
        return {notSent: {user, reason: localizeMessage('invite.members.user-is-not-guest', 'This person is already a member.')}};
    }
    let memberOfAll = true;
    let memberOfAny = false;

    for (const channel of channels) {
        const member = members && members[channel] && members[channel][user.id];
        if (member) {
            memberOfAny = true;
        } else {
            memberOfAll = false;
        }
    }

    if (memberOfAll) {
        return {notSent: {user, reason: localizeMessage('invite.guests.already-all-channels-member', 'This person is already a member of all the channels.')}};
    }

    try {
        await dispatch(addUsersToTeam(teamId, [user.id]));
        for (const channel of channels) {
            const member = members && members[channel] && members[channel][user.id];
            if (!member) {
                await dispatch(joinChannel(user.id, teamId, channel)); // eslint-disable-line no-await-in-loop
            }
        }
    } catch (e) {
        return {notSent: {user, reason: localizeMessage('invite.guests.unable-to-add-the-user-to-the-channels', 'Unable to add the guest to the channels.')}};
    }

    if (memberOfAny) {
        return {notSent: {user, reason: localizeMessage('invite.guests.already-some-channels-member', 'This person is already a member of some of the channels.')}};
    }
    return {sent: {user, reason: localizeMessage('invite.guests.new-member', 'This guest has been added to the team and channels.')}};
}

export function sendGuestsInvites(teamId, channels, users, emails, message) {
    return async (dispatch, getState) => {
        if (users.length > 0) {
            await dispatch(TeamActions.getTeamMembersByIds(teamId, users.map((u) => u.id)));
        }
        const state = getState();
        const sent = [];
        const notSent = [];
        const members = getChannelMembersInChannels(state);
        const results = await Promise.all(users.map((user) => sendGuestInviteForUser(dispatch, user, teamId, channels, members)));

        for (const result of results) {
            if (result.sent) {
                sent.push(result.sent);
            }
            if (result.notSent) {
                notSent.push(result.notSent);
            }
        }

        if (emails.length > 0) {
            let response;
            try {
                response = await dispatch(TeamActions.sendEmailGuestInvitesToChannels(teamId, channels, emails, message));
            } catch (e) {
                response = {error: localizeMessage('invite.guests.unable-to-add-the-user-to-the-channels', 'Unable to add the guest to the channels.')};
            }
            for (const email of emails) {
                if (response.error) {
                    notSent.push({email, reason: response.error.toString()});
                } else {
                    sent.push({email, reason: localizeMessage('invite.guests.added-to-channel', 'An invitation email has been sent.')});
                }
            }
        }
        return {sent, notSent};
    };
}
