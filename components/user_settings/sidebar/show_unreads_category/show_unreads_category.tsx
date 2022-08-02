// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import SettingItemMax from 'components/setting_item_max';
import SettingItemMin from 'components/setting_item_min';

type Props = {
    active: boolean;
    currentUserId: string;
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    showUnreadsCategory: boolean;
    updateSection: (section: string) => void;
}

type State = {
    active: boolean;
    checked: boolean;
    isSaving: boolean;
}

export default class ShowUnreadsCategory extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            active: false,
            checked: false,
            isSaving: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.active !== state.active) {
            if (props.active && !state.active) {
                return {
                    checked: props.showUnreadsCategory,
                    active: props.active,
                };
            }

            return {
                active: props.active,
            };
        }

        return null;
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            checked: e.target.value === 'true',
        });
    }

    handleSubmit = async () => {
        this.setState({isSaving: true});

        await this.props.savePreferences(this.props.currentUserId, [{
            user_id: this.props.currentUserId,
            category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.SHOW_UNREAD_SECTION,
            value: this.state.checked.toString(),
        }]);

        this.setState({isSaving: false});

        this.props.updateSection('');
    }

    renderDescription = () => {
        if (this.props.showUnreadsCategory) {
            return (
                <FormattedMessage
                    id='user.settings.sidebar.on'
                    defaultMessage='On'
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.sidebar.off'
                defaultMessage='Off'
            />
        );
    }

    render() {
        const title = (
            <FormattedMessage
                id='user.settings.sidebar.showUnreadsCategoryTitle'
                defaultMessage='Group unread channels separately'
            />
        );

        if (!this.props.active) {
            return (
                <SettingItemMin
                    title={title}
                    describe={this.renderDescription()}
                    section='showUnreadsCategory'
                    updateSection={this.props.updateSection}
                />
            );
        }

        return (
            <SettingItemMax
                title={title}
                inputs={
                    <fieldset>
                        <legend className='form-legend hidden-label'>
                            {title}
                        </legend>
                        <div className='radio'>
                            <label>
                                <input
                                    data-testid='showUnreadsCategoryOn'
                                    type='radio'
                                    name='showUnreadsCategory'
                                    checked={this.state.checked}
                                    onChange={() => this.setState({checked: true})}
                                />
                                <FormattedMessage
                                    id='user.settings.sidebar.on'
                                    defaultMessage='On'
                                />
                            </label>
                            <br/>
                        </div>
                        <div className='radio'>
                            <label>
                                <input
                                    data-testid='showUnreadsCategoryOff'
                                    type='radio'
                                    name='showUnreadsCategory'
                                    checked={!this.state.checked}
                                    onChange={() => this.setState({checked: false})}
                                />
                                <FormattedMessage
                                    id='user.settings.sidebar.off'
                                    defaultMessage='Off'
                                />
                            </label>
                            <br/>
                        </div>
                        <div className='mt-5'>
                            <FormattedMessage
                                id='user.settings.sidebar.showUnreadsCategoryDesc'
                                defaultMessage='When enabled, all unread channels and direct messages will be grouped together in the sidebar.'
                            />
                        </div>
                    </fieldset>
                }
                submit={this.handleSubmit}
                saving={this.state.isSaving}
                updateSection={this.props.updateSection}
            />
        );
    }
}
