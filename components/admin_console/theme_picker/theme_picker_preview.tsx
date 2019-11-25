import React from 'react';
import { Theme } from 'mattermost-redux/types/themes';
import logoImage from 'images/logo_compact.png';
import MenuIcon from 'components/widgets/icons/menu_icon';
import { FormattedMessage } from 'react-intl';
import { changeOpacity } from 'mattermost-redux/utils/theme_utils';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import StatusOnlineAvatarIcon from 'components/widgets/icons/status_online_avatar_icon';
import StatusAwayAvatarIcon from 'components/widgets/icons/status_away_avatar_icon';
import StatusDndAvatarIcon from 'components/widgets/icons/status_offline_avatar_icon';
import StatusOfflineIcon from 'components/widgets/icons/status_offline_icon';

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
                        color: theme.sidebarText,
                        borderRight: `1px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`,
                    }}
                >
                    <div 
                        className='theme-picker-preview__status'
                        style={{
                            backgroundColor: theme.sidebarHeaderBg, 
                            color: theme.sidebarHeaderTextColor
                        }}
                    >
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
                            <div className='theme-picker-preview__profile-user-name'>
                                <FormattedMessage
                                    id='admin.theme_picker.preview.mattermostUserName'
                                    defaultMessage='@mattermostuser'
                                />
                            </div>
                        </div>
                        <div className='theme-picker-preview__hamburger'>
                            <MenuIcon style={{fill: theme.sidebarHeaderTextColor}}/>
                        </div>
                    </div>
                    <div className='theme-picker-preview__channel-list'>
                        <ul>
                            <li className='theme-picker-preview__channel-list-header'>
                                <FormattedMessage
                                    id='admin.theme_picker.preview.publicChannels'
                                    defaultMessage='PUBLIC CHANNELS'
                                />
                            </li>
                            <li className='theme-picker-preview__read-channel'>
                                <GlobeIcon 
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.sidebarHeaderTextColor}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.readChannel'
                                    defaultMessage='Read Channel'
                                />
                            </li>
                            <li 
                                className='theme-picker-preview__hover-channel'
                                style={{backgroundColor: theme.sidebarTextHoverBg}}
                            >
                                <GlobeIcon 
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.sidebarHeaderTextColor}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.hoveredChannel'
                                    defaultMessage='Hovered Channel'
                                />
                            </li>
                            <li 
                                className='theme-picker-preview__active-channel'
                                style={{
                                    color: theme.sidebarTextActiveColor,
                                    borderLeft: `5px solid ${theme.sidebarTextActiveBorder}`,
                                    backgroundColor: changeOpacity(theme.sidebarTextActiveColor, 0.1),
                                }}
                            >
                                <GlobeIcon 
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.sidebarHeaderTextColor}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.activeChannel'
                                    defaultMessage='Active Channel'
                                />
                            </li>
                            <li 
                                className='theme-picker-preview__unread-channel'
                                style={{color: theme.sidebarUnreadText}}
                            >
                                <GlobeIcon 
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.sidebarHeaderTextColor}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.unreadChannel'
                                    defaultMessage='Unread Channel'
                                />
                                <span
                                    className='theme-picker-preview__mention-badge'
                                    style={{
                                        backgroundColor: theme.mentionBg,
                                        color: theme.mentionColor,
                                    }}
                                >
                                    {'5'}
                                </span>
                            </li>
                            <li className='theme-picker-preview__channel-list-header'>
                                &nbsp;
                            </li>
                            <li className='theme-picker-preview__channel-list-header'>
                                <FormattedMessage
                                    id='admin.theme_picker.preview.directMessages'
                                    defaultMessage='DIRECT MESSAGES'
                                />
                            </li>
                            <li className='theme-picker-preview__read-channel'>
                                <StatusOnlineAvatarIcon
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.onlineIndicator}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.onlineUser'
                                    defaultMessage='Online User'
                                />
                            </li>
                            <li className='theme-picker-preview__read-channel'>
                                <StatusAwayAvatarIcon
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.awayIndicator}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.awayUser'
                                    defaultMessage='Away User'
                                />
                            </li>
                            <li className='theme-picker-preview__read-channel'>
                                <StatusDndAvatarIcon
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.dndIndicator}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.dndUser'
                                    defaultMessage='DND User'
                                />
                            </li>
                            <li className='theme-picker-preview__read-channel'>
                                <StatusDndAvatarIcon
                                    className='theme-picker-preview__sidebar-icon' 
                                    style={{fill: theme.sidebarHeaderTextColor}}
                                />
                                <FormattedMessage
                                    id='admin.theme_picker.preview.offlineUser'
                                    defaultMessage='Offline User'
                                />
                            </li>
                        </ul>
                    </div>
                </div>
                <div 
                    className='theme-picker-preview__center-channel'
                    style={{
                        backgroundColor: theme.centerChannelBg,
                        color: theme.centerChannelColor,
                    }}
                >
                    <div 
                        className='theme-picker-preview__center-channel-header'
                        style={{borderBottom: `1px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`}}
                    >
                        <div className='theme-picker-preview__channel-header-name'>
                            <FormattedMessage
                                id='admin.theme_picker.preview.channelName'
                                defaultMessage='Channel Name'
                            />
                        </div>
                        <div className='theme-picker-preview__center-channel-description'>
                            <FormattedMessage
                                id='admin.theme_picker.preview.channelDescription'
                                defaultMessage='This is a channel description'
                            />
                        </div>
                    </div>
                    <div className='theme-picker-preview__center-channel-main'>
                        <div className='theme-picker-preview__center-channel-post'>
                            <div className='theme-picker-preview__profile-icon'>
                                <img
                                    alt={'profile logo'}
                                    src={logoImage}
                                />
                            </div>
                            <div className='theme-picker-preview__center-channel-post-body'>
                                <div className='theme-picker-preview__profile-display-name'>
                                    <FormattedMessage
                                        id='admin.theme_picker.preview.mattermostUserDisplayName'
                                        defaultMessage='Mattermost User'
                                    />
                                </div>
                                <div 
                                    className='theme-picker-preview__center-channel-post-message'
                                    style={{backgroundColor: changeOpacity(theme.centerChannelColor, 0.05)}}    
                                >
                                    <FormattedMessage
                                        id='admin.theme_picker.preview.mattermostUserName'
                                        defaultMessage='This is a post by your user.'
                                    />
                                </div>
                                <div
                                    className='theme-picker-preview__center-channel-button'
                                    style={{backgroundColor: theme.buttonBg, color: theme.buttonColor}}
                                >
                                    <FormattedMessage
                                        id='admin.theme_picker.preview.button'
                                        defaultMessage='This is a button.'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='theme-picker-preview__center-channel-post'>
                            <div className='theme-picker-preview__profile-icon'>
                                <img
                                    alt={'profile logo'}
                                    src={logoImage}
                                />
                            </div>
                            <div className='theme-picker-preview__center-channel-post-body'>
                                <div className='theme-picker-preview__profile-display-name'>
                                    <FormattedMessage
                                        id='admin.theme_picker.preview.mattermostUserDisplayName'
                                        defaultMessage='A Different Mattermost User'
                                    />
                                </div>
                                <div className='theme-picker-preview__center-channel-post-message'>
                                    {'TODO: Insert code block'}
                                </div>
                            </div>
                        </div>
                        <div className='theme-picker-preview__center-channel-post'>
                            <div className='theme-picker-preview__profile-icon'>
                                <img
                                    alt={'profile logo'}
                                    src={logoImage}
                                />
                            </div>
                            <div className='theme-picker-preview__center-channel-post-body'>
                                <div className='theme-picker-preview__profile-display-name'>
                                    <FormattedMessage
                                        id='admin.theme_picker.preview.mattermostUserDisplayName'
                                        defaultMessage='Another Different Mattermost User'
                                    />
                                </div>
                                <div className='theme-picker-preview__center-channel-post-message'>
                                    <span style={{backgroundColor: theme.mentionHighlightBg, color: theme.mentionHighlightLink}}>
                                        <FormattedMessage
                                            id='admin.theme_picker.preview.mattermostUserName'
                                            defaultMessage='@mattermostuser'
                                        />
                                    </span>
                                    &nbsp;
                                    <FormattedMessage
                                        id='admin.theme_picker.preview.mattermostUserName'
                                        defaultMessage='This is a mention by another user.'
                                    />
                                    <span style={{color: theme.linkColor}}>
                                        <FormattedMessage
                                            id='admin.theme_picker.preview.linkToOtherChannel'
                                            defaultMessage='~link-to-other-channel'
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='theme-picker-preview__center-channel-new-message'>
                            <hr style={{borderTop: `1px solid ${theme.newMessageSeparator}`}}/>
                            <span style={{color: theme.newMessageSeparator}}>
                                <FormattedMessage
                                    id='admin.theme_picker.preview.newMessages'
                                    defaultMessage='New Messages'
                                />
                            </span>
                            <hr style={{borderTop: `1px solid ${theme.newMessageSeparator}`}}/>
                        </div>
                    </div>
                    <div 
                        className='theme-picker-preview__center-channel-create-post'
                        style={{
                            border: `1px solid ${changeOpacity(theme.centerChannelColor, 0.2)}`,
                            color: changeOpacity(theme.centerChannelColor, 0.6),
                        }}
                    >
                        <FormattedMessage
                            id='admin.theme_picker.preview.writeAPost'
                            defaultMessage='Write a post...'
                        />
                    </div>
                    <div 
                        className='theme-picker-preview__center-channel-error'
                        style={{color: theme.errorTextColor}}
                    >
                        <FormattedMessage
                            id='admin.theme_picker.preview.errorText'
                            defaultMessage='Error Text'
                        />
                    </div>
                </div>
            </div>
        );
    }
}