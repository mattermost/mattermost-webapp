// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {
    showMentions,
    closeRightHandSide,
} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {GlobalState} from 'types/store/index';

import AtMentionsButton from './at_mentions_button';

type Props = ComponentProps<typeof AtMentionsButton>;

function mapStateToProps(state: GlobalState): Omit<Props, 'actions'> {
    return {
        rhsState: getRhsState(state),
    };
}

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>): Pick<Props, 'actions'> => ({
    actions: bindActionCreators({
        showMentions,
        closeRightHandSide,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AtMentionsButton);
