// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {FormattedMessage} from 'react-intl';
import React from 'react';

import {t} from 'utils/i18n';
import SectionCreator from '../generic/section_creator';

const formattingTitle = {
    id: t('user.settings.advance.formattingTitle'),
    defaultMessage: 'Enable Post Formatting',

};

const formattingDesc = {
    id: t('user.settings.advance.formattingDesc'),
    defaultMessage: 'If enabled, posts will be formatted to create links, show emoji, style the text, and add line breaks. By default, this setting is enabled.',
};

type Props = {
    formatting: string;
    updateSetting: (setting: string, value: string) => void;
}

function FormattingSection({formatting, updateSetting}: Props): JSX.Element {
    const content = (
        <>
            <fieldset key='formattingSetting'>
                <legend className='form-legend hidden-label'>
                    <FormattedMessage
                        id='user.settings.advance.formattingTitle'
                        defaultMessage='Enable Post Formatting'
                    />
                </legend>
                <div className='radio'>
                    <label>
                        <input
                            id='postFormattingOn'
                            type='radio'
                            name='formatting'
                            checked={formatting !== 'false'}
                            onChange={() => {
                                updateSetting('formatting', 'true');
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.on'
                            defaultMessage='On'
                        />
                    </label>
                    <br/>
                </div>
                <div className='radio'>
                    <label>
                        <input
                            id='postFormattingOff'
                            type='radio'
                            name='formatting'
                            checked={formatting === 'false'}
                            onChange={() => {
                                updateSetting('formatting', 'false');
                            }}
                        />
                        <FormattedMessage
                            id='user.settings.advance.off'
                            defaultMessage='Off'
                        />
                    </label>
                    <br/>
                </div>
            </fieldset>
        </>
    );

    return (
        <SectionCreator
            title={formattingTitle}
            description={formattingDesc}
            content={content}
        />
    );
}

export default FormattingSection;
