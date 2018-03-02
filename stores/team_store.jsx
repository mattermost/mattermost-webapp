// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import EventEmitter from 'events';

import {TeamTypes} from 'mattermost-redux/action_types';
import * as Selectors from 'mattermost-redux/selectors/entities/teams';

import ChannelStore from 'stores/channel_store.jsx';
import store from 'stores/redux_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import {getSiteURL} from 'utils/url.jsx';
import AppDispatcher from '../dispatcher/app_dispatcher.jsx';

const NotificationPrefs = Constants.NotificationPrefs;

const ActionTypes = Constants.ActionTypes;

const CHANGE_EVENT = 'change';
const STATS_EVENT = 'stats';
const UNREAD_EVENT = 'unread';

var Utils;

class TeamStoreClass extends EventEmitter {
    constructor() {
        super();

        this.entities = store.getState().entities.teams;

        store.subscribe(() => {
            const newEntities = store.getState().entities.teams;
            const entities = this.entities;
            this.entities = newEntities;

            let doEmit = false;

            if (newEntities.currentTeamId !== entities.currentTeamId) {
                doEmit = true;
            }

            if (newEntities.teams !== entities.teams) {
                doEmit = true;
            }

            if (newEntities.myMembers !== entities.myMembers) {
                doEmit = true;
                this.emitUnreadChange();
            }

            if (newEntities.membersInTeam !== entities.membersInTeam) {
                doEmit = true;
            }

            if (newEntities.stats !== entities.stats) {
                this.emitStatsChange();
            }

            if (doEmit) {
                this.emitChange();
            }
        });
    }

    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

    emitStatsChange() {
        this.emit(STATS_EVENT);
    }

    addStatsChangeListener(callback) {
        this.on(STATS_EVENT, callback);
    }

    removeStatsChangeListener(callback) {
        this.removeListener(STATS_EVENT, callback);
    }

    emitUnreadChange() {
        this.emit(UNREAD_EVENT);
    }

    addUnreadChangeListener(callback) {
        this.on(UNREAD_EVENT, callback);
    }

    removeUnreadChangeListener(callback) {
        this.removeListener(UNREAD_EVENT, callback);
    }

    get(id) {
        var c = this.getAll();
        return c[id];
    }

    getByName(name) {
        const t = this.getAll();

        for (const id in t) {
            if (t.hasOwnProperty(id)) {
                if (t[id].name === name) {
                    return t[id];
                }
            }
        }

        return null;
    }

    getAll() {
        const list = Selectors.getMyTeams(store.getState());
        const teams = {};
        list.forEach((t) => {
            teams[t.id] = t;
        });
        return teams;
    }

    getCurrentId() {
        return Selectors.getCurrentTeamId(store.getState());
    }

    setCurrentId(id) {
        store.dispatch({
            type: TeamTypes.SELECT_TEAM,
            data: id,
        });
    }

    getCurrent() {
        const team = Selectors.getCurrentTeam(store.getState());

        if (team) {
            return team;
        }

        return null;
    }

    getCurrentTeamUrl() {
        return this.getTeamUrl(this.getCurrentId());
    }

    getCurrentTeamRelativeUrl() {
        return this.getTeamRelativeUrl(this.getCurrentId());
    }

    getCurrentInviteLink() {
        const current = this.getCurrent();

        if (current) {
            return getSiteURL() + '/signup_user_complete/?id=' + current.invite_id;
        }

        return '';
    }

    getTeamRelativeUrl(id) {
        const team = this.get(id);

        if (!team) {
            return '';
        }

        return '/' + team.name;
    }

    getTeamUrl(id) {
        const team = this.get(id);

        if (!team) {
            return '';
        }

        return getSiteURL() + '/' + team.name;
    }

    getCurrentStats() {
        return this.getStats(this.getCurrentId());
    }

    getStats(teamId) {
        let stats;

        if (teamId) {
            stats = Selectors.getTeamStats(store.getState())[teamId];
        }

        if (stats) {
            // create a defensive copy
            stats = Object.assign({}, stats);
        } else {
            stats = {member_count: 0};
        }

        return stats;
    }

    saveTeam(team) {
        const teams = {};
        teams[team.id] = team;
        this.saveTeams(teams);
    }

    saveTeams(teams) {
        store.dispatch({
            type: TeamTypes.RECEIVED_TEAMS,
            data: teams,
        });
    }

    updateTeam(team) {
        const t = JSON.parse(team);
        const teams = Object.assign({}, this.getAll(), this.getTeamListings());
        if (teams && teams[t.id]) {
            this.saveTeam(t);
        }
    }

    saveMyTeam(team) {
        this.saveTeam(team);
        this.setCurrentId(team.id);
    }

    saveStats(teamId, stats) {
        store.dispatch({
            type: TeamTypes.RECEIVED_TEAM_STATS,
            data: stats,
        });
    }

    saveMyTeamMembers(members) {
        store.dispatch({
            type: TeamTypes.RECEIVED_MY_TEAM_MEMBERS,
            data: members,
        });
    }

    appendMyTeamMember(member) {
        const members = this.getMyTeamMembers();
        members.push(member);
        this.saveMyTeamMembers(members);
    }

    saveMyTeamMembersUnread(members) {
        const myMembers = this.getMyTeamMembers();
        for (let i = 0; i < myMembers.length; i++) {
            const team = myMembers[i];
            const member = members.filter((m) => m.team_id === team.team_id)[0];

            if (member) {
                myMembers[i] = Object.assign({},
                    team,
                    {
                        msg_count: member.msg_count,
                        mention_count: member.mention_count,
                    });
            }
        }

        this.saveMyTeamMembers(myMembers);
    }

    removeMyTeamMember(teamId) {
        const myMembers = this.getMyTeamMembers();
        for (let i = 0; i < myMembers.length; i++) {
            if (myMembers[i].team_id === teamId) {
                myMembers.splice(i, 1);
            }
        }

        this.saveMyTeamMembers(myMembers);
    }

    getMyTeamMembers() {
        return Object.values(Selectors.getTeamMemberships(store.getState()));
    }

    saveMembersInTeam(members) {
        store.dispatch({
            type: TeamTypes.RECEIVED_MEMBERS_IN_TEAM,
            data: Object.values(members),
        });
    }

    removeMemberInTeam(teamId = this.getCurrentId(), userId) {
        store.dispatch({
            type: TeamTypes.REMOVE_MEMBER_FROM_TEAM,
            data: {team_id: teamId, user_id: userId},
        });
    }

    getMembersInTeam(teamId = this.getCurrentId()) {
        return Selectors.getMembersInTeams(store.getState())[teamId] || {};
    }

    getMemberInTeam(teamId = this.getCurrentId(), userId) {
        return Selectors.getTeamMember(store.getState(), teamId, userId);
    }

    hasActiveMemberInTeam(teamId = this.getCurrentId(), userId) {
        if (this.getMemberInTeam(teamId, userId)) {
            return true;
        }

        return false;
    }

    getTeamListings() {
        return Selectors.getJoinableTeams(store.getState());
    }

    isTeamAdminForAnyTeam() {
        if (!Utils) {
            Utils = require('utils/utils.jsx'); //eslint-disable-line global-require
        }

        for (const teamMember of this.getMyTeamMembers()) {
            if (Utils.isAdmin(teamMember.roles)) {
                return true;
            }
        }

        return false;
    }

    isTeamAdmin(userId, teamId) {
        if (!Utils) {
            Utils = require('utils/utils.jsx'); //eslint-disable-line global-require
        }

        var teamMembers = this.getMyTeamMembers();
        const teamMember = teamMembers.find((m) => m.user_id === userId && m.team_id === teamId);

        if (teamMember) {
            return Utils.isAdmin(teamMember.roles);
        }

        return false;
    }

    updateMyRoles(member) {
        const teamMembers = this.getMyTeamMembers();
        const teamMember = teamMembers.find((m) => m.user_id === member.user_id && m.team_id === member.team_id);

        if (teamMember) {
            const newMember = Object.assign({}, teamMember, {
                roles: member.roles,
            });

            store.dispatch({
                type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
                data: newMember,
            });
        }
    }

    incrementMessages(id, channelId) {
        const channelMember = ChannelStore.getMyMember(channelId);
        if (channelMember && channelMember.notify_props && channelMember.notify_props.mark_unread === NotificationPrefs.MENTION) {
            return;
        }

        const member = Object.assign({}, this.getMyTeamMembers().filter((m) => m.team_id === id)[0]);
        member.msg_count++;

        store.dispatch({
            type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
            data: member,
        });
    }

    incrementMentionsIfNeeded(id, msgProps) {
        let mentions = [];
        if (msgProps && msgProps.mentions) {
            mentions = JSON.parse(msgProps.mentions);
        }

        if (mentions.indexOf(UserStore.getCurrentId()) !== -1) {
            const member = Object.assign({}, this.getMyTeamMembers().filter((m) => m.team_id === id)[0]);
            member.mention_count++;

            store.dispatch({
                type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
                data: member,
            });
        }
    }
}

var TeamStore = new TeamStoreClass();

TeamStore.dispatchToken = AppDispatcher.register((payload) => {
    var action = payload.action;

    switch (action.type) {
    case ActionTypes.RECEIVED_MY_TEAM:
        TeamStore.saveMyTeam(action.team);
        break;
    case ActionTypes.RECEIVED_TEAM:
        TeamStore.saveTeam(action.team);
        break;
    case ActionTypes.CREATED_TEAM:
        TeamStore.saveTeam(action.team);
        TeamStore.appendMyTeamMember(action.member);
        break;
    case ActionTypes.UPDATE_TEAM:
        TeamStore.saveTeam(action.team);
        break;
    case ActionTypes.RECEIVED_ALL_TEAMS:
        TeamStore.saveTeams(action.teams);
        break;
    case ActionTypes.RECEIVED_MY_TEAM_MEMBERS:
        TeamStore.saveMyTeamMembers(action.team_members);
        break;
    case ActionTypes.RECEIVED_MY_TEAMS_UNREAD:
        TeamStore.saveMyTeamMembersUnread(action.team_members);
        break;
    case ActionTypes.RECEIVED_ALL_TEAM_LISTINGS:
        TeamStore.saveTeamListings(action.teams);
        break;
    case ActionTypes.RECEIVED_MEMBERS_IN_TEAM:
        TeamStore.saveMembersInTeam(action.team_members);
        break;
    case ActionTypes.RECEIVED_TEAM_STATS:
        TeamStore.saveStats(action.team_id, action.stats);
        break;
    default:
    }
});

TeamStore.setMaxListeners(15);

window.TeamStore = TeamStore;
export default TeamStore;
