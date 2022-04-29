// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';

import {GlobalState} from 'mattermost-redux/types/store';
import {TimeFrame, TimeFrames, TopChannel, TopReaction} from 'mattermost-redux/types/insights';

import {getCurrentTeamId} from './teams';

function sortTopReactions(reactions: TopReaction[] = []): TopReaction[] {
    return reactions.sort((a, b) => {
        return b.count - a.count;
    });
}

function sortTopChannels(channels: TopChannel[] = []): TopChannel[] {
    return channels.sort((a, b) => {
        return b.message_count - a.message_count;
    });
}

export function getTeamReactions(state: GlobalState) {
    return state.entities.insights.topReactions;
}

export const getReactionTimeFramesForCurrentTeam: (state: GlobalState) => Record<TimeFrame, Record<string, TopReaction>> = createSelector(
    'getReactionTimeFramesForCurrentTeam',
    getCurrentTeamId,
    getTeamReactions,
    (currentTeamId, reactions) => {
        return reactions[currentTeamId];
    },
);

export const getTopReactionsForCurrentTeam: (state: GlobalState, timeFrame: TimeFrame, maxResults?: number) => TopReaction[] = createSelector(
    'getTopReactionsForCurrentTeam',
    getReactionTimeFramesForCurrentTeam,
    (state: GlobalState, timeFrame: TimeFrames) => timeFrame,
    (state: GlobalState, timeFrame: TimeFrames, maxResults = 5) => maxResults,
    (reactions, timeFrame, maxResults) => {
        if (reactions && reactions[timeFrame]) {
            const reactionArr = Object.values(reactions[timeFrame]);
            sortTopReactions(reactionArr);

            return reactionArr.slice(0, maxResults);
        }
        return [];
    },
);

export function getMyTopReactions(state: GlobalState) {
    return state.entities.insights.myTopReactions;
}

export const getMyReactionTimeFramesForCurrentTeam: (state: GlobalState) => Record<TimeFrame, Record<string, TopReaction>> = createSelector(
    'getMyReactionTimeFramesForCurrentTeam',
    getCurrentTeamId,
    getMyTopReactions,
    (currentTeamId, reactions) => {
        return reactions[currentTeamId];
    },
);

export const getMyTopReactionsForCurrentTeam: (state: GlobalState, timeFrame: TimeFrame, maxResults?: number) => TopReaction[] = createSelector(
    'getMyTopReactionsForCurrentTeam',
    getMyReactionTimeFramesForCurrentTeam,
    (state: GlobalState, timeFrame: TimeFrames) => timeFrame,
    (state: GlobalState, timeFrame: TimeFrames, maxResults = 5) => maxResults,
    (reactions, timeFrame, maxResults) => {
        if (reactions && reactions[timeFrame]) {
            const reactionArr = Object.values(reactions[timeFrame]);
            sortTopReactions(reactionArr);

            return reactionArr.slice(0, maxResults);
        }
        return [];
    },
);

export function getTeamTopChannels(state: GlobalState) {
    return state.entities.insights.topChannels;
}

export const getChannelTimeFramesForCurrentTeam: (state: GlobalState) => Record<TimeFrame, Record<string, TopChannel>> = createSelector(
    'getChannelTimeFramesForCurrentTeam',
    getCurrentTeamId,
    getTeamTopChannels,
    (currentTeamId, channels) => {
        return channels[currentTeamId];
    },
);

export const getTopChannelsForCurrentTeam: (state: GlobalState, timeFrame: TimeFrame, maxResults?: number) => TopChannel[] = createSelector(
    'getTopChannelsForCurrentTeam',
    getChannelTimeFramesForCurrentTeam,
    (state: GlobalState, timeFrame: TimeFrames) => timeFrame,
    (state: GlobalState, timeFrame: TimeFrames, maxResults = 5) => maxResults,
    (channels, timeFrame, maxResults) => {
        if (channels && channels[timeFrame]) {
            const channelArr = Object.values(channels[timeFrame]);
            sortTopChannels(channelArr);

            return channelArr.slice(0, maxResults);
        }
        return [];
    },
);

export function getMyTopChannels(state: GlobalState) {
    return state.entities.insights.myTopChannels;
}

export const getMyChannelTimeFramesForCurrentTeam: (state: GlobalState) => Record<TimeFrame, Record<string, TopChannel>> = createSelector(
    'getMyChannelTimeFramesForCurrentTeam',
    getCurrentTeamId,
    getMyTopChannels,
    (currentTeamId, channels) => {
        return channels[currentTeamId];
    },
);

export const getMyTopChannelsForCurrentTeam: (state: GlobalState, timeFrame: TimeFrame, maxResults?: number) => TopChannel[] = createSelector(
    'getMyTopChannelsForCurrentTeam',
    getMyChannelTimeFramesForCurrentTeam,
    (state: GlobalState, timeFrame: TimeFrames) => timeFrame,
    (state: GlobalState, timeFrame: TimeFrames, maxResults = 5) => maxResults,
    (channels, timeFrame, maxResults) => {
        if (channels && channels[timeFrame]) {
            const channelArr = Object.values(channels[timeFrame]);
            sortTopChannels(channelArr);

            return channelArr.slice(0, maxResults);
        }
        return [];
    },
);
