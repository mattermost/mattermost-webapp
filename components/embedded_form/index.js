// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {submitInteractiveDialog} from 'mattermost-redux/actions/integrations';

import {getEmojiMap} from 'selectors/emojis';

import EmbeddedForm from './embedded_form';

function mapStateToProps(state, ownProps) {
    const data = ownProps.dialog;
    if (!data || !data.dialog) {
        return {};
    }

    return {
        url: data.url,
        callbackId: data.dialog.callback_id,
        elements: data.dialog.elements,
        title: data.dialog.title,
        introductionText: data.dialog.introduction_text,
        iconUrl: data.dialog.icon_url,
        submitLabel: data.dialog.submit_label,
        state: data.dialog.state,
        emojiMap: getEmojiMap(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            submitInteractiveDialog,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbeddedForm);
