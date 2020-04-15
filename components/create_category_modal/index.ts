// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import CreateCategoryModal from './create_category_modal';

function mapStateToProps(state: GlobalState) {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            createCategory: () => null,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCategoryModal);
