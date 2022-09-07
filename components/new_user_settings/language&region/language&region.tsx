// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect, {ValueType} from 'react-select';

import {useDispatch, useSelector} from 'react-redux';

import timezones from 'timezones.json';

import GenericSectionCreator from '../generic_section_creator';
import {
    getCurrentUser,
    getCurrentUserId,
} from 'mattermost-redux/selectors/entities/common';

import {
    getTimezoneLabel as GetTimezoneLabel,
    makeGetUserTimezone,
} from 'mattermost-redux/selectors/entities/timezone';
import {UserTimezone} from '@mattermost/types/users';
import {GlobalState} from 'types/store';
import {getBrowserTimezone} from 'utils/timezone';
import {updateMe} from 'mattermost-redux/actions/users';
import {getTimezoneLabel} from 'mattermost-redux/utils/timezone_utils';
import * as I18n from 'i18n/i18n.jsx';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import SaveChangesPanel from '../../user_settings/generic/save_changes_panel';

const twelveHourClock = '12-hour clock (example: 4:00 PM)';
const twentyFourHourClock = '24-hour clock (example: 16:00)';

type SelectedOption = {
    value: string;
    label: string;
};

const LanguageAndRegion: FC = () => {
    const dispatch = useDispatch();
    const checkboxRef = useRef<any>();

    const getUserTimezone = useSelector(makeGetUserTimezone);

    const currentUserId = useSelector(getCurrentUserId);
    const timeZones = timezones;
    const timezoneLabel = useSelector((state: GlobalState) =>
        GetTimezoneLabel(state, currentUserId),
    );
    const userTimezone: UserTimezone = useSelector((state: GlobalState) =>
        getUserTimezone(state, currentUserId),
    );

    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [selectedOption, setSelectedOption] = useState({
        label: timezoneLabel,
        value: userTimezone.useAutomaticTimezone ? userTimezone.automaticTimezone : userTimezone.manualTimezone,
    });
    const [useAutomaticTimezone, setUseAutomatictimeZone] = useState(
        userTimezone.useAutomaticTimezone,
    );
    const [automaticTimezone, setAutomatictimeZone] = useState(
        userTimezone.automaticTimezone,
    );

    const [manualTimezone, setManualTimeZone] = useState(
        userTimezone.manualTimezone,
    );

    const user = useSelector(getCurrentUser);

    const timeOptions = timeZones.map((timeObject) => {
        return {
            value: timeObject.utc[0],
            label: timeObject.text,
        };
    });
    const config = useSelector(getConfig);
    const defaultClientLocale = config.DefaultClientLocale as string;

    let userLocale = user.locale;
    if (!I18n.isLanguageAvailable(userLocale)) {
        userLocale = defaultClientLocale;
    }
    const [locale, setLocale] = useState(userLocale);

    const options: SelectedOption[] = [];
    const locales: any = I18n.getLanguages();

    const [selectedLanguageOption, setSelectedLanguageOption] = useState({
        value: locales[userLocale].value,
        label: locales[userLocale].name,
    });
    const [militaryTime, setMilitaryTime] = useState(
        useSelector((state: GlobalState) =>
            get(
                state,
                Preferences.CATEGORY_DISPLAY_SETTINGS,
                Preferences.USE_MILITARY_TIME,
                Preferences.USE_MILITARY_TIME_DEFAULT,
            ),
        ),
    );

    const languages = Object.keys(locales).
        map((l) => {
            return {
                value: locales[l].value as string,
                name: locales[l].name,
                order: locales[l].order,
            };
        }).
        sort((a, b) => a.order - b.order);

    languages.forEach((lang) => {
        options.push({value: lang.value, label: lang.name});
    });

    const onChange = (selectedOption: ValueType<SelectedOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            setManualTimeZone(selectedOption.value);
            setSelectedOption(selectedOption);
        }
    };

    const handleAutomaticTimezone = (e: boolean) => {
        const useAutomaticTimezone = checkboxRef.current.checked;
        let automaticTimezone = '';
        let TimezoneLabel: string;
        let selectedOptionValue: string;

        if (useAutomaticTimezone) {
            automaticTimezone = getBrowserTimezone();
            TimezoneLabel = getTimezoneLabel(timeZones, automaticTimezone);
            selectedOptionValue = automaticTimezone;
        } else {
            selectedOptionValue = getBrowserTimezone();
            TimezoneLabel = getTimezoneLabel(timeZones, getBrowserTimezone());
            setManualTimeZone(getBrowserTimezone());
        }

        setUseAutomatictimeZone(useAutomaticTimezone);
        setAutomatictimeZone(automaticTimezone);
        setSelectedOption({label: TimezoneLabel, value: selectedOptionValue});

        setUnsavedChanges(true);
    };

    const setLanguage = (selectedLanguageOption: ValueType<SelectedOption>) => {
        setUnsavedChanges(true);
        if (selectedLanguageOption && 'value' in selectedLanguageOption) {
            setLocale(selectedLanguageOption.value);
            setSelectedLanguageOption(selectedLanguageOption);
        }
    };

    const changeTimePreferences = (pref: any) => {
        setUnsavedChanges(true);
        if (pref === twelveHourClock) {
            setMilitaryTime('false');
        } else if (pref === twentyFourHourClock) {
            setMilitaryTime('true');
        }
    };
    const handleCancel = () => {

    };

    const handleSubmit = () => {
        const timezone = {
            useAutomaticTimezone: useAutomaticTimezone.toString(),
            automaticTimezone,
            manualTimezone,
        };

        const timePreference = {
            user_id: user.id,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.USE_MILITARY_TIME,
            value: militaryTime,
        };

        const preferences = [timePreference];

        const updatedUser = {
            ...user,
            timezone,
            locale,
        };
        dispatch(savePreferences(user.id, preferences));
        dispatch(updateMe(updatedUser));
    };
    return (
        <div className='section'>
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.language&time.language',
                    message: 'Language',
                    titleClassname: 'font-16-weight-600 Pb-8',
                },
                description: {
                    id: 'user.settings.language&time.selectLanguage',
                    message:
                        "Select the language you'd prefer to use in Mattermost.",
                    descriptionClassname:
                        'font-12-weight-400 section-description Pb-24',
                },
                subSection: {
                    select: (
                        <div className='Pb-8'>
                            <ReactSelect
                                className='React-select'
                                classNamePrefix='react-select'
                                id='displayLanguage'
                                options={options}
                                clearable={false}
                                onChange={setLanguage}
                                value={selectedLanguageOption}
                                aria-labelledby='changeInterfaceLanguageLabel'
                            />
                            {/* {serverError} */}
                        </div>
                    ),
                },
                xtraInfo: (
                    <div className='section-description Pb-24'>
                        <FormattedMessage
                            id='user.settings.language&time.joinServer'
                            defaultMessage='Join the [Mattermost Translation Server](!http://translate.mattermost.com/) to help with translations.'
                        />
                    </div>
                ),
            })}
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.language&time.timeZone',
                    message: 'Timezone',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-8',
                },
                description: {
                    id: 'user.settings.language&time.selectTimezone',
                    message:
                        'Select your timezone for message timestamps and email notifications.',
                    descriptionClassname:
                        'font-12-weight-400 section-description Pb-14',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.language&time.automatically',
                            message: 'Set timezone automatically',
                            checked: Boolean(useAutomaticTimezone),
                            ref: checkboxRef,
                            checkBoxContentClassname: 'Pb-14',
                        },
                    ],
                },
                onCheckBoxChange: handleAutomaticTimezone,
                xtraInfo: (
                    <div className='Pb-24'>
                        <ReactSelect
                            className='React-select'
                            classNamePrefix='react-select'
                            id='displayLanguage'
                            options={timeOptions}
                            clearable={false}
                            onChange={(e) => {
                                onChange(e);
                                setUnsavedChanges(true);
                            }}
                            value={selectedOption}
                            aria-labelledby='changeInterfaceLanguageLabel'
                            isDisabled={Boolean(useAutomaticTimezone)}
                        />
                        {/* {serverError} */}
                    </div>
                ),
            })}
            {GenericSectionCreator({
                title: {
                    id: 'user.settings.language&time.timeFormat',
                    message: 'Time format',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-8',
                },
                description: {
                    id: 'user.settings.language&time.selectTimeFormat',
                    message: 'Select the time format you prefer.',
                    descriptionClassname:
                        'font-12-weight-400 section-description Pb-14',
                },
                subSection: {
                    radio: [
                        [
                            {
                                id: 'user.settings.language&time.12HourFormat',
                                message: '12-hour clock (example: 4:00 PM)',
                                checked: militaryTime === 'false',
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.language&time.24HourFormat',
                                message: '24-hour clock (example: 16:00)',
                                checked: militaryTime === 'true',
                            },
                        ],
                    ],
                },
                onRadioChange: changeTimePreferences,
            })}
            {unsavedChanges && (
                <SaveChangesPanel
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default LanguageAndRegion;
