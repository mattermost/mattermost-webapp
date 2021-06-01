// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import PostMessagePreview from './post_message_preview';
import {getUser} from 'mattermost-redux/selectors/entities/users';

type Props = {
    userId: string;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const user = getUser(state, ownProps.userId);
    console.log('here bud');
    console.log(user);
    return {
        user,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostMessagePreview);