// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addCommand} from 'mattermost-redux/actions/integrations';

import AddCommand from './add_command.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        addCommand
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(AddCommand);
