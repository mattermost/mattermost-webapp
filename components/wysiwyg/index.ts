// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants';
import {isCustomEmojiEnabled} from 'selectors/emojis';
import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';

import Wysiwyg from './wysiwyg';

function mapStateToProps(state: GlobalState) {
    return {
        reduxConfig: getConfig(state),
        useCustomEmojis: isCustomEmojiEnabled(state),
        locale: getCurrentLocale(state),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        codeBlockOnCtrlEnter: getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Wysiwyg);

export * from './wysiwyg';
