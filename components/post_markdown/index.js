// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import PostMarkdown from './post_markdown';

function mapStateToProps(state) {
    return {
        pluginHooks: state.plugins.hooks.MessageWillFormat,
    };
}

export default connect(mapStateToProps)(PostMarkdown);
