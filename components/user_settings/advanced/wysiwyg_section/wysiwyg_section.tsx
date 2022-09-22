// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {defineMessages, injectIntl, IntlShape} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';

import {AdvancedSections} from 'utils/constants';

import {t} from 'utils/i18n';

import {PreferenceType} from '@mattermost/types/preferences';

const messages = defineMessages({
    title: {
        id: t('user.settings.advance.wysiwyg.title'),
        defaultMessage: t('WYSIWYG Message Editor'),
    },
    off: {
        id: t('user.settings.advance.off'),
        defaultMessage: t('Off'),
    },
    on: {
        id: t('user.settings.advance.on'),
        defaultMessage: t('On'),
    },
    desc: {
        id: t('user.settings.advance.wysiwyg.desc'),
        defaultMessage: t('If the WYSIWYG (What you see is what you get) editor is enabled, formatting in messages will show as you type rather than only after you’ve sent the message.'),
    },
});

type Props = {
    activeSection?: string;
    currentUserId: string;
    intl: IntlShape;
    wysiwyg?: string;
    onUpdateSection: (section?: string) => void;
    renderOnOffLabel: (label: string) => ReactNode;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
    };
}

type State = {
    wysiwygState?: string;
    isSaving?: boolean;
    serverError?: string;
}

export class WysiwygSection extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            wysiwygState: props.wysiwyg,
        };
    }

    public formatMessage = this.props.intl.formatMessage

    public handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.currentTarget.value;

        this.setState({wysiwygState: value});
    }

    public handleUpdateSection = (section?: string): void => {
        if (!section) {
            this.setState({wysiwygState: this.props.wysiwyg});
        }

        this.props.onUpdateSection(section);
    }

    public title = this.formatMessage(messages.title);

    public handleSubmit = (): void => {
        const {actions, currentUserId, onUpdateSection} = this.props;
        const wysiwygPreference = {category: Preferences.CATEGORY_ADVANCED_SETTINGS, user_id: currentUserId, name: Preferences.ADVANCED_WYSIWYG, value: this.state.wysiwygState};
        actions.savePreferences(currentUserId, [wysiwygPreference]);

        onUpdateSection();
    }

    public render(): React.ReactNode {
        const {wysiwygState} = this.state;
        if (this.props.activeSection === AdvancedSections.WYSIWYG) {
            return (
                <SettingItemMax
                    title={this.title}
                    inputs={[
                        <fieldset key='wysiwygSetting'>
                            <legend className='form-legend hidden-label'>
                                {this.title}
                            </legend>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='wysiwygOn'
                                        type='radio'
                                        value={'true'}
                                        name={AdvancedSections.WYSIWYG}
                                        checked={wysiwygState === 'true'}
                                        onChange={this.handleOnChange}
                                    />
                                    {this.formatMessage(messages.on)}
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='wysiwygOff'
                                        type='radio'
                                        value={'false'}
                                        name={AdvancedSections.WYSIWYG}
                                        checked={wysiwygState === 'false'}
                                        onChange={this.handleOnChange}
                                    />
                                    {this.formatMessage(messages.off)}
                                </label>
                                <br/>
                            </div>
                            <div className='mt-5'>
                                {this.formatMessage(messages.desc)}
                            </div>
                        </fieldset>,
                    ]}
                    setting={AdvancedSections.WYSIWYG}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        return (
            <SettingItemMin
                title={this.title}
                describe={this.props.renderOnOffLabel(wysiwygState!)}
                section={AdvancedSections.WYSIWYG}
                updateSection={this.handleUpdateSection}
            />
        );
    }
}

export default injectIntl(WysiwygSection);
