// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {redirect} from './actions';
import PermalinkRedirector from './permalink_redirector';

const mapStateToProps = (state, ownProps) => {
    return {
        params: ownProps.match.params,
        url: ownProps.match.url,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({
            redirect,
        }, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PermalinkRedirector);
