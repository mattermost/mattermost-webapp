// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import EditedPostItem from './edited_post_item';

function mapStateToProps(state: GlobalState) {
    return {
        // todo sinan you should get restore button
    };
}

export default connect(mapStateToProps)(EditedPostItem);
