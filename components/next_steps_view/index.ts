// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {setShowNextStepsView} from 'actions/views/next_steps';
import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants';

import NextStepsView from './next_steps_view';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => {
        const license = getLicense(state);

        return {
            currentUser: getCurrentUser(state),
            preferences: getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
            skuName: license.SkuShortName,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            setShowNextStepsView,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NextStepsView);
