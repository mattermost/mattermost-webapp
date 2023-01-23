// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {isCustomEmojiEnabled} from 'selectors/emojis';
import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';

import {Wysiwyg} from './wysiwyg';

function mapStateToProps(state: GlobalState) {
    return {
        reduxConfig: getConfig(state),
        useCustomEmojis: isCustomEmojiEnabled(state),
        locale: getCurrentLocale(state),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Wysiwyg);

export * from './wysiwyg';
