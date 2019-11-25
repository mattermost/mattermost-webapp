import React from 'react';
import { Theme } from 'mattermost-redux/types/themes';
import logoImage from 'images/logo_compact.png';
import MenuIcon from 'components/widgets/icons/menu_icon';
import { FormattedMessage } from 'react-intl';

type Props = {
    theme: Theme;
}

export default class ThemePickerPreview extends React.Component<Props> {
    public render() {
        if (!this.props.theme) {
            return (
                <div>{'No theme selected'}</div>
            );
        }

        const {theme} = this.props;
        return (
            <div className='theme-picker-preview'>
                <div 
                    className='theme-picker-preview__sidebar'
                    style={{
                        backgroundColor: theme.sidebarBg,
                        color: theme.sidebarText
                    }}
                >
                    <div className='theme-picker-preview__status'>
                        <div className='theme-picker-preview__profile-icon'>
                            <img
                                alt={'profile logo'}
                                src={logoImage}
                            />
                        </div>
                        <div className='theme-picker-preview__profile-info'>
                            <div className='theme-picker-preview__profile-display-name'>
                                <FormattedMessage
                                    id='admin.theme_picker.preview.mattermostUserDisplayName'
                                    defaultMessage='Mattermost User'
                                />
                            </div>
                            <div>
                                <FormattedMessage
                                    id='admin.theme_picker.preview.mattermostUserName'
                                    defaultMessage='@mattermostuser'
                                />
                            </div>
                        </div>
                        <div className='theme-picker-preview__hamburger'>
                            <MenuIcon/>
                        </div>
                    </div>
                </div>
                <div 
                    className='theme-picker-preview__center-channel'
                    style={{
                        backgroundColor: theme.centerChannelBg,
                        color: theme.centerChannelColor,
                    }}
                >

                </div>
            </div>
        );
    }
}