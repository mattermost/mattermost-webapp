// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import PostType from './component';

const mapStateToProps = (state) => {
    return {
        theme: getTheme(state),
    };
};

export default connect(mapStateToProps, null)(PostType);
