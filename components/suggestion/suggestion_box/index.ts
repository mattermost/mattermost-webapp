// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {addMessageIntoHistory} from 'mattermost-redux/actions/posts';

import {GenericAction} from 'mattermost-redux/types/actions';

import {SuggestionBox, SuggestionBoxForwarded} from './suggestion_box';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            addMessageIntoHistory,
        }, dispatch),
    };
}

export type {
    SuggestionBoxForwarded,
};
export default connect(null, mapDispatchToProps, null, {forwardRef: true})(SuggestionBox);
