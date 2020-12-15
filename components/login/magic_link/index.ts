// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {loginByMagicLink, sendMagicLinkEmail} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import MagicLink from './magic_link';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    let customDescriptionText = '';
    if (config.EnableCustomBrand === 'true') {
        customDescriptionText = config.CustomDescriptionText || '';
    }

    return {
        customDescriptionText,
        enableSignInWithMagicLink: config.EnableSignInWithMagicLink === 'true',
        siteName: config.SiteName,
    };
}

const mapDispatchToProps = {
    loginByMagicLink,
    sendMagicLinkEmail,
};

export default connect(mapStateToProps, mapDispatchToProps)(MagicLink);
