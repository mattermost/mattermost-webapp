// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import EmbeddedForm from './embedded_form';

function mapStateToProps(state: GlobalState) {
    return {
        currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(EmbeddedForm);
