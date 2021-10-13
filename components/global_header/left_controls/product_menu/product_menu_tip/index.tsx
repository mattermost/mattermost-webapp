// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {Preferences} from 'utils/constants';
import {ProductComponent} from '../../../../../types/store/plugins';

import ProductMenuTip from './product_menu_tip';

export type StateProps = {
    currentUserId: string;
    products: ProductComponent[];
    step: number;
}

export type DispatchProps = {
    actions: Actions;
}

type Actions = {
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
};

export type Props = StateProps & DispatchProps;

function mapStateToProps(state: GlobalState) {
    const currentUserId = getCurrentUserId(state);
    const step: number = getInt(state, Preferences.TUTORIAL_STEP, currentUserId, 0);
    const products = state.plugins.components.Product;
    return {
        currentUserId,
        products,
        step,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            savePreferences,
        }, dispatch),
    };
}

export default connect<StateProps, DispatchProps, Record<string, never>, GlobalState>(mapStateToProps, mapDispatchToProps)(ProductMenuTip);
