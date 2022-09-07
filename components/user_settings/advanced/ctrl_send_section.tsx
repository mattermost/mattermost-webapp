// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {FormattedMessage} from 'react-intl';
import React from 'react';

import {useSelector} from 'react-redux';

import {t} from '../../../utils/i18n';
import {isMac} from '../../../utils/utils';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from '../../../utils/constants';
import {GlobalState} from '../../../types/store';
import SectionCreator from '../generic/section_creator';

const getCtrlSendText = () => {
    const description = {
        default: {
            id: t('user.settings.advance.sendDesc'),
            defaultMessage: 'When enabled, CTRL + ENTER will send the message and ENTER inserts a new line.',
        },
        mac: {
            id: t('user.settings.advance.sendDesc.mac'),
            defaultMessage: 'When enabled, ⌘ + ENTER will send the message and ENTER inserts a new line.',
        },
    };
    const title = {
        default: {
            id: t('user.settings.advance.sendTitle'),
            defaultMessage: 'Send Messages on CTRL+ENTER',
        },
        mac: {
            id: t('user.settings.advance.sendTitle.mac'),
            defaultMessage: 'Send Messages on ⌘+ENTER',
        },
    };
    if (isMac()) {
        return {
            ctrlSendTitle: title.mac,
            ctrlSendDesc: description.mac,
        };
    }
    return {
        ctrlSendTitle: title.default,
        ctrlSendDesc: description.default,
    };
};
type Props = {
    updateSetting: (setting: string, value: string) => void;
}
function CtrlSendSection({updateSetting}: Props): JSX.Element {
    const {ctrlSendTitle, ctrlSendDesc} = getCtrlSendText();
    const sendOnCtrlEnter = useSelector(((state: GlobalState) => get(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter', 'false')));
    const codeBlockOnCtrlEnter = useSelector(((state: GlobalState) => get(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', 'true')));
    const ctrlSendActive = [
        sendOnCtrlEnter === 'true',
        sendOnCtrlEnter === 'false' && codeBlockOnCtrlEnter === 'true',
        sendOnCtrlEnter === 'false' && codeBlockOnCtrlEnter === 'false',
    ];

    const content = (
        <>
            <fieldset key='ctrlSendSetting'>
                <legend className='form-legend hidden-label'>
                    <FormattedMessage {...ctrlSendTitle}/>
                </legend>
                <div className='radio'>
                    <label>
                        <input
                            id='ctrlSendOn'
                            type='radio'
                            name='sendOnCtrlEnter'
                            checked={ctrlSendActive[0]}
                            onChange={() => {
                                updateSetting('send_on_ctrl_enter', 'true');
                                updateSetting('code_block_ctrl_enter', 'true');
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.onForAllMessages'
                            defaultMessage='On for all messages'
                        />
                    </label>
                    <br/>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='ctrlSendOnForCode'
                            type='radio'
                            name='sendOnCtrlEnter'
                            checked={ctrlSendActive[1]}
                            onChange={() => {
                                updateSetting('send_on_ctrl_enter', 'false');
                                updateSetting('code_block_ctrl_enter', 'true');
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.onForCode'
                            defaultMessage='On only for code blocks starting with ```'
                        />
                    </label>
                    <br/>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='ctrlSendOff'
                            type='radio'
                            name='sendOnCtrlEnter'
                            checked={ctrlSendActive[2]}
                            onChange={() => {
                                updateSetting('send_on_ctrl_enter', 'false');
                                updateSetting('code_block_ctrl_enter', 'false');
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.off'
                            defaultMessage='Off'
                        />
                    </label>
                </div>
            </fieldset>
        </>
    );

    return (
        <SectionCreator
            title={ctrlSendTitle}
            description={ctrlSendDesc}
            content={content}
        />
    );
}

export default CtrlSendSection;
