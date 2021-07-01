// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {Theme} from 'mattermost-redux/types/themes';
import * as Utils from '../../../../../../utils/utils';

import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import CustomThemeChooser from './custom_theme_chooser';
import ThemeThumbnail from './theme_thumbnail';

const ThemeChooser: React.FC<Props> = ({
    header,
    allowedThemes,
    theme,
    onThemeChange,
    allowCustomThemes,
    onImportBtnClick,
    onCustomThemeClick,
}: Props) => {
    const customThemeSelected = theme.type === 'custom';
    return (
        <>
            <div className='theme-chooser-header'>{header}</div>
            <div className='themes-grid'>
                {allowedThemes.map((allowedTheme) => (
                    <div
                        key={allowedTheme.type}
                        className='themes-grid__item'
                    >
                        <div
                            className={classNames({
                                'themes-grid__thumbnail': true,
                                'themes-grid__thumbnail_active': theme.type?.toLowerCase() === allowedTheme.type?.toLowerCase(),
                            })}
                            onClick={() => onThemeChange(allowedTheme)}
                        >
                            {theme.type?.toLowerCase() === allowedTheme.type?.toLowerCase() && <span className='fa fa-check-circle themes-grid__thumbnail-active-check'/>}
                            <ThemeThumbnail
                                themeKey={allowedTheme.type as string}
                                themeName={allowedTheme.type as string}
                                sidebarBg={allowedTheme.sidebarBg}
                                sidebarText={changeOpacity(allowedTheme.sidebarText, 0.48)}
                                sidebarUnreadText={allowedTheme.sidebarUnreadText}
                                onlineIndicator={allowedTheme.onlineIndicator}
                                awayIndicator={allowedTheme.awayIndicator}
                                dndIndicator={allowedTheme.dndIndicator}
                                centerChannelColor={changeOpacity(allowedTheme.centerChannelColor, 0.16)}
                                centerChannelBg={allowedTheme.centerChannelBg}
                                newMessageSeparator={allowedTheme.newMessageSeparator}
                                buttonBg={allowedTheme.buttonBg}
                            />
                        </div>
                        <div className='themes-grid__label'>{Utils.toTitleCase(allowedTheme.type)}</div>
                    </div>
                ))}
                {allowCustomThemes && (
                    <div className='themes-grid__item'>
                        <div
                            className={classNames({
                                'themes-grid__thumbnail': true,
                                'themes-grid__thumbnail_active': customThemeSelected,
                            })}
                            onClick={onCustomThemeClick}
                        >
                            {customThemeSelected && <span className='fa fa-check-circle themes-grid__thumbnail-active-check'/>}
                            <span className='fa fa-pencil'/>
                        </div>
                        <div className='themes-grid__label'>
                            <FormattedMessage
                                id='user.settings.display.theme.customTheme'
                                defaultMessage='Custom Theme'
                            />
                        </div>
                    </div>
                )}
            </div>
            {allowCustomThemes && customThemeSelected && (
                <CustomThemeChooser
                    theme={theme}
                    updateTheme={onThemeChange}
                    onImportBtnClick={onImportBtnClick}
                />
            )}
        </>
    );
};

type Props = {
    header: ReactNode;
    allowedThemes: Theme[];
    theme: Theme;
    onThemeChange: (newTheme: Theme) => void;
    onCustomThemeClick: () => void;
    allowCustomThemes: boolean;
    onImportBtnClick: () => void;
}

export default ThemeChooser;
