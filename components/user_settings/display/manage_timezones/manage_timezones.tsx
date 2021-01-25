// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {getTimezoneRegion} from 'mattermost-redux/utils/timezone_utils';
import {FormattedMessage} from 'react-intl';
import ReactSelect, {ValueType} from 'react-select';

import {UserProfile} from 'mattermost-redux/types/users';
import {ActionResult} from 'mattermost-redux/types/actions';

import SettingItemMax from 'components/setting_item_max.jsx';
import {getBrowserTimezone} from 'utils/timezone';
import {isKeyPressed} from 'utils/utils.jsx';
import Constants from 'utils/constants';

type Actions = {
    updateMe: (user: UserProfile) => Promise<ActionResult>;
}

type Props ={
    user: UserProfile;
    updateSection: (section: string) => void;
    useAutomaticTimezone: boolean;
    automaticTimezone: string;
    manualTimezone: string;
    timezones: string[];
    actions: Actions;
    times:string[];
}
type SelectedOption = {
    value: string;
    label: string;
}


type State ={
    useAutomaticTimezone: boolean;
    automaticTimezone: string;
    manualTimezone: string;
    manualTimezoneInput: string;
    isSaving: boolean;
    serverError?: string;
    openMenu: boolean;
    selectedOption: SelectedOption;
}

export default class ManageTimezones extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        

        this.state = {
            useAutomaticTimezone: props.useAutomaticTimezone,
            automaticTimezone: props.automaticTimezone,
            manualTimezone: props.manualTimezone,
            manualTimezoneInput: props.manualTimezone,
            isSaving: false,
            openMenu: false,
            selectedOption: {label:props.manualTimezone, value: props.manualTimezone},
        };
    }

    onChange = (selectedOption:ValueType<SelectedOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            this.setState({
                manualTimezoneInput: selectedOption.value,
                manualTimezone:selectedOption.value,
                selectedOption,
            });
    };
    }

    handleTimezoneSelected = (selected: string) => {
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
            then((res) => {
                if ('data' in res) {
                    this.props.updateSection('');
                } else if ('error' in res) {
                    const {error} = res;
                    let serverError;
                    if (error instanceof Error) {
                        serverError = error.message;
                    } else {
                        serverError = error as string;
                    }
                    this.setState({serverError, isSaving: false});
                }
            });
    };

    handleAutomaticTimezone = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    handleManualTimezone = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({manualTimezone: e.target.value});
    };
    handleContainerKeyDown = (e: KeyboardEvent) => {
        const modalBody = document.querySelector('.modal-body');
        if (isKeyPressed(e, Constants.KeyCodes.ESCAPE) && this.state.openMenu) {
            modalBody?.classList.remove('no-scroll');
            this.setState({openMenu: false});
            e.stopPropagation();
        }
    };

    handleKeyDown = (e: React.KeyboardEvent) => {
        const modalBody = document.querySelector('.modal-body');
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            modalBody?.classList.add('no-scroll');
            this.setState({openMenu: true});
        }
    };
    handleMenuClose = () => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.classList.remove('no-scroll');
        }
        this.setState({openMenu: false});
    };

    handleMenuOpen = () => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.classList.add('no-scroll');
        }
        this.setState({openMenu: true});
    };

    render() {
        const timeOptions = this.props.times.map((timeString) => {
            return {
                value: timeString,
                label: timeString
              }
            }
          );
        const {timezones} = this.props;
        console.log(this.props.times);
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
        const reactStyles = {
            
            menuPortal: (provided: React.CSSProperties) => ({
                ...provided,
                zIndex: 9999,
            }),
          
        };

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
                        defaultMessage='Automatic'
                    />
                
                </label>
            </div>
        );

        const TimeInput=(
            <div 
            className='pt-2'
            >
                <ReactSelect
                         className='react-select react-select-top'
                         classNamePrefix='react-select'
                         id='displayTimezone'
                         menuIsOpen={this.state.openMenu}
                         menuPortalTarget={document.body}
                         styles={reactStyles}
                         options={timeOptions}
                         clearable={false}
                         onChange={this.onChange}
                         onKeyDown={this.handleKeyDown}
                         value={useAutomaticTimezone? {label:this.state.automaticTimezone, value:this.state.automaticTimezone}:this.state.selectedOption}
                         onMenuClose={this.handleMenuClose}
                         onMenuOpen={this.handleMenuOpen}
                         aria-labelledby='changeInterfaceTimezoneLabel'
                         isDisabled={useAutomaticTimezone}
                    />
            </div>
        )

        inputs.push(automaticTimezoneInput);
    
        inputs.push(TimeInput);       

        inputs.push(
            <div>
                <br/>
                <FormattedMessage
                    id='user.settings.timezones.promote'
                    defaultMessage='Select the time zone used for timestamps in the user interface and email notifications.'
                />
            </div>,
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

