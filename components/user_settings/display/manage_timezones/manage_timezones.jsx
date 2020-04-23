// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {getTimezoneRegion} from 'mattermost-redux/utils/timezone_utils';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import SettingItemMax from 'components/setting_item_max.jsx';
import {getBrowserTimezone} from 'utils/timezone';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import TimezoneProvider from 'components/suggestion/timezone_provider.jsx';

export default class ManageTimezones extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object.isRequired,
        updateSection: PropTypes.func.isRequired,
        useAutomaticTimezone: PropTypes.bool.isRequired,
        automaticTimezone: PropTypes.string.isRequired,
        manualTimezone: PropTypes.string.isRequired,
        timezones: PropTypes.array.isRequired,
        actions: PropTypes.shape({
            updateMe: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            useAutomaticTimezone: props.useAutomaticTimezone,
            automaticTimezone: props.automaticTimezone,
            manualTimezone: props.manualTimezone,
            manualTimezoneInput: props.manualTimezone,
            isSaving: false,
        };
    }

    onChange = (e) => {
        this.setState({manualTimezoneInput: e.target.value});
    };

    handleTimezoneSelected = (selected) => {
        if (!selected) {
            return;
        }

        this.setState({
            manualTimezone: selected,
            manualTimezoneInput: selected,
        });
    };

    timezoneNotChanged = () => {
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone,
        } = this.state;

        const {
            useAutomaticTimezone: oldUseAutomaticTimezone,
            automaticTimezone: oldAutomaticTimezone,
            manualTimezone: oldManualTimezone,
        } = this.props;

        return (
            useAutomaticTimezone === oldUseAutomaticTimezone &&
            automaticTimezone === oldAutomaticTimezone &&
            manualTimezone === oldManualTimezone
        );
    };

    changeTimezone = () => {
        if (this.timezoneNotChanged()) {
            this.props.updateSection('');
            return;
        }

        this.submitUser();
    };

    submitUser = () => {
        const {user, actions} = this.props;
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone,
        } = this.state;

        const timezone = {
            useAutomaticTimezone: useAutomaticTimezone.toString(),
            automaticTimezone,
            manualTimezone,
        };

        const updatedUser = {
            ...user,
            timezone,
        };

        actions.updateMe(updatedUser).
            then(({data, error: err}) => {
                if (data) {
                    this.props.updateSection('');
                } else if (err) {
                    let serverError;
                    if (err.message) {
                        serverError = err.message;
                    } else {
                        serverError = err;
                    }
                    this.setState({serverError, isSaving: false});
                }
            });
    };

    handleAutomaticTimezone = (e) => {
        const useAutomaticTimezone = e.target.checked;
        let automaticTimezone = '';

        if (useAutomaticTimezone) {
            automaticTimezone = getBrowserTimezone();
        }

        this.setState({
            useAutomaticTimezone,
            automaticTimezone,
        });
    };

    handleManualTimezone = (e) => {
        this.setState({manualTimezone: e.target.value});
    };

    render() {
        const {timezones} = this.props;
        const {
            useAutomaticTimezone,
            automaticTimezone,
        } = this.state;

        let serverError;
        if (this.state.serverError) {
            serverError = <label className='has-error'>{this.state.serverError}</label>;
        }

        const inputs = [];

        const timezoneRegion = (
            <div
                className='section-describe pt-2'
            >
                {useAutomaticTimezone && getTimezoneRegion(automaticTimezone)}
            </div>
        );

        const noTimezonesFromServer = timezones.length === 0;
        const automaticTimezoneInput = (
            <div className='checkbox'>
                <label>
                    <input
                        id='automaticTimezoneInput'
                        type='checkbox'
                        checked={useAutomaticTimezone}
                        onChange={this.handleAutomaticTimezone}
                        disabled={noTimezonesFromServer}
                    />
                    <FormattedMessage
                        id='user.settings.timezones.automatic'
                        defaultMessage='Set automatically'
                    />
                    {timezoneRegion}
                </label>
            </div>
        );

        const providers = [new TimezoneProvider()];
        const manualTimezoneInput = (
            <div key='changeTimezone'>
                <label className='control-label'>
                    <FormattedMessage
                        id='user.settings.timezones.change'
                        defaultMessage='Change timezone'
                    />
                </label>
                <div className='pt-2'>
                    <SuggestionBox
                        ref={this.setSwitchBoxRef}
                        className='form-control focused'
                        type='search'
                        onChange={this.onChange}
                        value={this.state.manualTimezoneInput}
                        onItemSelected={this.handleTimezoneSelected}
                        listComponent={SuggestionList}
                        maxLength='64'
                        requiredCharacters={0}
                        providers={providers}
                        listStyle='bottom'
                        completeOnTab={false}
                        renderDividers={false}
                        openOnFocus={true}
                        disabled={noTimezonesFromServer}
                    />
                    {serverError}
                </div>
            </div>
        );

        inputs.push(automaticTimezoneInput);

        if (!useAutomaticTimezone) {
            inputs.push(manualTimezoneInput);
        }

        inputs.push(
            <div>
                <br/>
                <FormattedHTMLMessage
                    id='user.settings.timezones.promote'
                    defaultMessage='Select the time zone used for timestamps in the user interface and email notifications.'
                />
            </div>
        );

        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.timezone'
                        defaultMessage='Timezone'
                    />
                }
                containerStyle='timezone-container'
                width='medium'
                submit={this.changeTimezone}
                saving={this.state.isSaving}
                inputs={inputs}
                updateSection={this.props.updateSection}
            />
        );
    }
}

