// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import tinycolor from 'tinycolor2';

import {applyTheme} from 'utils/utils.jsx';

import SettingItemMax from '../../../../setting_item_max';
import {OsColorSchemeName} from 'mattermost-redux/types/general';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {Theme} from 'mattermost-redux/types/themes';

import {ActionResult} from 'mattermost-redux/types/actions';

import AppDispatcher from '../../../../../dispatcher/app_dispatcher';

import {ActionTypes} from '../../../../../utils/constants';

import {Preferences} from 'mattermost-redux/constants';

import SyncWithOsCheckbox from './sync_with_os_checkbox';
import ThemeChooser from './theme_chooser';

const Expanded: React.FC<Props> = (props: Props) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formState, setFormState] = useState<FormState>({
        dirty: {syncWithOs: false, lightTheme: false, darkTheme: false},
        syncWithOs: props.enableThemeSync,
        lightTheme: props.lightTheme,
        darkTheme: props.darkTheme,
        applyToAllTeams: props.applyToAllTeams,
    });

    // the below useEffect is updating form when settings have been saved in another place, eg. mobile app
    useEffect(() => {
        setFormState({
            dirty: {syncWithOs: false, lightTheme: false, darkTheme: false},
            syncWithOs: props.enableThemeSync,
            lightTheme: props.lightTheme,
            darkTheme: props.darkTheme,
            applyToAllTeams: props.applyToAllTeams,
        });
    }, [props.applyToAllTeams, props.enableThemeSync, props.lightTheme, props.darkTheme]);

    useEffect(() => {
        props.setRequireConfirm(Object.values(formState.dirty).reduce((prev, curr) => prev || curr, false));
    }, [props.setRequireConfirm, formState.dirty]);

    const effectiveTheme = (formState.syncWithOs && props.osColorScheme === 'dark') ? formState.darkTheme : formState.lightTheme;
    useEffect(() => {
        applyTheme(effectiveTheme);
    }, [effectiveTheme]);

    // themeRef allows access current theme inside useEffect which needs to trigger only on unmount (has no deps - the second arg is an empty array)
    const themeRef = useRef(props.theme);
    useEffect(() => {
        themeRef.current = props.theme;
    }, [props.theme]);
    useEffect(() => () => {
        applyTheme(themeRef.current);
    }, []);

    const handleOsSyncToggle = (syncWithOs: boolean) => {
        if (!syncWithOs) {
            setFormState((prev) => ({
                ...prev,
                dirty: {...prev.dirty, syncWithOs: syncWithOs !== props.enableThemeSync},
                syncWithOs,
                lightTheme: effectiveTheme,
                savedLightTheme: prev.lightTheme,
            }));
            return;
        }
        const shouldSwapTheme = tinycolor(formState.lightTheme.centerChannelBg).isDark();
        setFormState((prev) => ({
            ...prev,
            dirty: {...prev.dirty, syncWithOs: syncWithOs !== props.enableThemeSync},
            syncWithOs,
            ...((shouldSwapTheme || prev.savedLightTheme) && {lightTheme: prev.savedLightTheme || props.defaultLightTheme}),
            ...(shouldSwapTheme && {darkTheme: formState.lightTheme}),
        }));
    };

    const handleImportModal = (callback: (theme: Theme) => void) => () => {
        AppDispatcher.handleViewAction({
            type: ActionTypes.TOGGLE_IMPORT_THEME_MODAL,
            value: true,
            callback,
        });

        props.setEnforceFocus(false);
    };

    const handleSubmit = async () => {
        const teamId = formState.applyToAllTeams ? '' : props.currentTeamId;
        setIsSaving(true);

        await props.actions.savePreferences(props.userId, [
            {
                user_id: props.userId,
                category: Preferences.CATEGORY_ENABLE_THEME_SYNC,
                name: teamId,
                value: String(formState.syncWithOs),
            },
            {
                user_id: props.userId,
                category: Preferences.CATEGORY_THEME,
                name: teamId,
                value: JSON.stringify(formState.lightTheme),
            },
            {
                user_id: props.userId,
                category: Preferences.CATEGORY_THEME_DARK,
                name: teamId,
                value: JSON.stringify(formState.darkTheme),
            },
        ]);

        if (formState.applyToAllTeams) {
            await props.actions.deleteTeamSpecificThemes();
        }

        props.setRequireConfirm(false);
        setIsSaving(false);
        props.updateSection('');
    };

    const handleThemeChange = (changeDark: boolean) => (theme: Theme) => setFormState((prevState) => {
        const savedTheme = changeDark ? props.darkTheme : props.lightTheme;
        const isDirty = Object.keys(theme).reduce((prev, curr) => prev || theme[curr] !== savedTheme[curr], false);
        return changeDark ? {
            ...prevState,
            dirty: {...prevState.dirty, darkTheme: isDirty},
            darkTheme: theme,
        } : {
            ...prevState,
            dirty: {...prevState.dirty, lightTheme: isDirty},
            lightTheme: theme,
        };
    });

    return (
        <SettingItemMax
            title={
                <FormattedMessage
                    id='user.settings.display.theme.title'
                    defaultMessage='Theme'
                />
            }
            inputs={
                <>
                    <SyncWithOsCheckbox
                        checked={formState.syncWithOs}
                        onChange={handleOsSyncToggle}
                        osColorScheme={props.osColorScheme}
                    />
                    {formState.syncWithOs ? (
                        <>
                            <ThemeChooser
                                header={
                                    <FormattedMessage
                                        id='user.settings.display.theme.chooseLight'
                                        defaultMessage='Choose a light theme'
                                    />
                                }
                                allowCustomThemes={props.allowCustomThemes}
                                onImportBtnClick={handleImportModal(handleThemeChange(false))}
                                allowedThemes={props.allowedThemes.filter((theme) => theme.colorScheme === 'light')}
                                onThemeChange={handleThemeChange(false)}
                                theme={formState.lightTheme}
                                onCustomThemeClick={() => handleThemeChange(false)({...formState.lightTheme, type: 'custom'})}
                            />
                            <ThemeChooser
                                header={
                                    <FormattedMessage
                                        id='user.settings.display.theme.chooseDark'
                                        defaultMessage='Choose a dark theme'
                                    />
                                }
                                allowCustomThemes={props.allowCustomThemes}
                                onImportBtnClick={handleImportModal(handleThemeChange(true))}
                                allowedThemes={props.allowedThemes.filter((theme) => theme.colorScheme === 'dark')}
                                onThemeChange={handleThemeChange(true)}
                                theme={formState.darkTheme}
                                onCustomThemeClick={() => handleThemeChange(true)({...formState.darkTheme, type: 'custom'})}
                            />
                        </>
                    ) : (
                        <ThemeChooser
                            header={
                                <FormattedMessage
                                    id='user.settings.display.theme.chooseTheme'
                                    defaultMessage='Choose a theme'
                                />
                            }
                            allowCustomThemes={props.allowCustomThemes}
                            onImportBtnClick={handleImportModal(handleThemeChange(false))}
                            allowedThemes={props.allowedThemes}
                            onThemeChange={handleThemeChange(false)}
                            theme={formState.lightTheme}
                            onCustomThemeClick={() => handleThemeChange(false)({...formState.lightTheme, type: 'custom'})}
                        />
                    )}
                    {props.showAllTeamsCheckbox && (
                        <div className='checkbox user-settings__submit-checkbox'>
                            <label>
                                <input
                                    id='applyThemeToAllTeams'
                                    type='checkbox'
                                    checked={formState.applyToAllTeams}
                                    onChange={(e) => {
                                        const applyToAllTeams = e.target.checked;
                                        setFormState((prev) => ({...prev, applyToAllTeams}));
                                    }}
                                />
                                <FormattedMessage
                                    id='user.settings.display.theme.applyToAllTeams'
                                    defaultMessage='Apply new theme color choices to all my teams'
                                />
                            </label>
                        </div>
                    )}
                </>
            }
            submit={handleSubmit}
            disableEnterSubmit={true}
            saving={isSaving}
            width='full'
            updateSection={props.updateSection}
        />
    );
};

type Props = {
    updateSection: (section: string) => void;
    enableThemeSync: boolean;
    osColorScheme: OsColorSchemeName;
    applyToAllTeams: boolean;
    showAllTeamsCheckbox: boolean;
    currentTeamId: string;
    userId: string;
    setRequireConfirm: (requireConfirm?: boolean) => void;
    setEnforceFocus: (enforceFocus?: boolean) => void;
    actions: Actions;
    allowCustomThemes: boolean;
    allowedThemes: Theme[];
    lightTheme: Theme;
    darkTheme: Theme;
    theme: Theme;
    defaultLightTheme: Theme;
}

export type Actions = {
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    deleteTeamSpecificThemes: () => Promise<ActionResult>;
}

type FormState = {
    dirty: {
        syncWithOs: boolean;
        lightTheme: boolean;
        darkTheme: boolean;
    };
    syncWithOs: boolean;
    lightTheme: Theme;
    darkTheme: Theme;
    applyToAllTeams: boolean;
    savedLightTheme?: Theme;
}

export default Expanded;
