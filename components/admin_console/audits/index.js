// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAudits} from 'mattermost-redux/actions/admin';
import * as Selectors from 'mattermost-redux/selectors/entities/admin';

import Audits from './audits.jsx';

const mapStateToProps = (state) => ({
    audits: Object.values(Selectors.getAudits(state))
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getAudits
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Audits);
