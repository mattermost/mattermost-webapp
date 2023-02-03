// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from '@mattermost/types/store';

import {createSelector} from 'reselect';

import {Team} from '@mattermost/types/teams';

import TeamSettings from './team_settings';

const mapStateToPropsTeamSettings = createSelector(
    'mapStateToPropsTeamSettings',
    (
        state: GlobalState,
        props: {
            team?: Team;
        },
    ) => {
        return {
            team: props.team || getCurrentTeam(state),
        };
    },
    (teamInfo) => ({...teamInfo}),
);

export default connect(mapStateToPropsTeamSettings)(TeamSettings);
