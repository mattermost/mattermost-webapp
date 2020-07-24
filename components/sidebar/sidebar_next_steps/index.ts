// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants';

import SidebarNextSteps from './sidebar_next_steps';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => ({
        preferences: getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    });
}

export default connect(makeMapStateToProps)(SidebarNextSteps);
