// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';

import RecordMessage from './record_message';

function mapStateToProps(state: GlobalState) {
    return {
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps, null)(RecordMessage);
