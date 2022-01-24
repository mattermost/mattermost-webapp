// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {Action} from 'mattermost-redux/types/actions';
import {checkIfTeamExists, createTeam} from 'mattermost-redux/actions/teams';

import FullscreenWizard, {Actions} from './fullscreen_wizard';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            createTeam,
            checkIfTeamExists,
        }, dispatch),
    };
}

function mapStateToProps() {}

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenWizard);
