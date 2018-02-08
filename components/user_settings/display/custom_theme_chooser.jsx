// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import 'bootstrap-colorpicker';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import ColorChooser from './color_chooser.jsx';

const messages = defineMessages({
    sidebarBg: {
        id: 'user.settings.custom_theme.sidebarBg',
        defaultMessage: 'Sidebar BG'
    },
    sidebarText: {
        id: 'user.settings.custom_theme.sidebarText',
        defaultMessage: 'Sidebar Text'
    },
    sidebarHeaderBg: {
        id: 'user.settings.custom_theme.sidebarHeaderBg',
        defaultMessage: 'Sidebar Header BG'
    },
    sidebarHeaderTextColor: {
        id: 'user.settings.custom_theme.sidebarHeaderTextColor',
        defaultMessage: 'Sidebar Header Text'
    },
    sidebarUnreadText: {
        id: 'user.settings.custom_theme.sidebarUnreadText',
        defaultMessage: 'Sidebar Unread Text'
    },
    sidebarTextHoverBg: {
        id: 'user.settings.custom_theme.sidebarTextHoverBg',
        defaultMessage: 'Sidebar Text Hover BG'
    },
    sidebarTextActiveBorder: {
        id: 'user.settings.custom_theme.sidebarTextActiveBorder',
        defaultMessage: 'Sidebar Text Active Border'
    },
    sidebarTextActiveColor: {
        id: 'user.settings.custom_theme.sidebarTextActiveColor',
        defaultMessage: 'Sidebar Text Active Color'
    },
    onlineIndicator: {
        id: 'user.settings.custom_theme.onlineIndicator',
        defaultMessage: 'Online Indicator'
    },
    awayIndicator: {
        id: 'user.settings.custom_theme.awayIndicator',
        defaultMessage: 'Away Indicator'
    },
    dndIndicator: {
        id: 'user.settings.custom_theme.dndIndicator',
        defaultMessage: 'Do Not Disturb Indicator'
    },
    mentionBg: {
        id: 'user.settings.custom_theme.mentionBj',
        defaultMessage: 'Mention Jewel BG'
    },
    mentionColor: {
        id: 'user.settings.custom_theme.mentionColor',
        defaultMessage: 'Mention Jewel Text'
    },
    centerChannelBg: {
        id: 'user.settings.custom_theme.centerChannelBg',
        defaultMessage: 'Center Channel BG'
    },
    centerChannelColor: {
        id: 'user.settings.custom_theme.centerChannelColor',
        defaultMessage: 'Center Channel Text'
    },
    newMessageSeparator: {
        id: 'user.settings.custom_theme.newMessageSeparator',
        defaultMessage: 'New Message Separator'
    },
    linkColor: {
        id: 'user.settings.custom_theme.linkColor',
        defaultMessage: 'Link Color'
    },
    buttonBg: {
        id: 'user.settings.custom_theme.buttonBg',
        defaultMessage: 'Button BG'
    },
    buttonColor: {
        id: 'user.settings.custom_theme.buttonColor',
        defaultMessage: 'Button Text'
    },
    errorTextColor: {
        id: 'user.settings.custom_theme.errorTextColor',
        defaultMessage: 'Error Text Color'
    },
    mentionHighlightBg: {
        id: 'user.settings.custom_theme.mentionHighlightBg',
        defaultMessage: 'Mention Highlight BG'
    },
    mentionHighlightLink: {
        id: 'user.settings.custom_theme.mentionHighlightLink',
        defaultMessage: 'Mention Highlight Link'
    },
    codeTheme: {
        id: 'user.settings.custom_theme.codeTheme',
        defaultMessage: 'Code Theme'
    }
});

class CustomThemeChooser extends React.Component {
    constructor(props) {
        super(props);
        const copyTheme = this.setCopyTheme(this.props.theme);

        this.state = {
            copyTheme
        };
    }

    componentDidMount() {
        $('.group--code').on('change', this.onCodeThemeChange);
    }

    componentWillUnmount() {
        $('.group--code').off('change', this.onCodeThemeChange);
    }

    handleColorChange = (settingId, color) => {
        const {updateTheme, theme} = this.props;
        if (theme[settingId] !== color) {
            const newTheme = {
                ...theme,
                type: 'custom',
                [settingId]: color
            };

            // For backwards compatability
            if (settingId === 'mentionBg') {
                newTheme.mentionBj = color;
            }

            updateTheme(newTheme);

            const copyTheme = this.setCopyTheme(newTheme);

            this.setState({
                copyTheme
            });
        }
    }

    setCopyTheme(theme) {
        const copyTheme = Object.assign({}, theme);
        delete copyTheme.type;
        delete copyTheme.image;

        return JSON.stringify(copyTheme);
    }

    pasteBoxChange = (e) => {
        let text = '';

        if (window.clipboardData && window.clipboardData.getData) { // IE
            text = window.clipboardData.getData('Text');
        } else {
            text = e.clipboardData.getData('Text');//e.clipboardData.getData('text/plain');
        }

        if (text.length === 0) {
            return;
        }

        let theme;
        try {
            theme = JSON.parse(text);
        } catch (err) {
            return;
        }

        this.setState({
            copyTheme: JSON.stringify(theme)
        });

        theme.type = 'custom';
        this.props.updateTheme(theme);
    }

    onChangeHandle = (e) => {
        e.stopPropagation();
    }

    selectTheme = () => {
        const textarea = this.refs.textarea;
        textarea.focus();
        textarea.setSelectionRange(0, this.state.copyTheme.length);
    }

    toggleSidebarStyles = (e) => {
        e.preventDefault();

        $(this.refs.sidebarStylesHeader).toggleClass('open');
        this.toggleSection(this.refs.sidebarStyles);
    }

    toggleCenterChannelStyles = (e) => {
        e.preventDefault();

        $(this.refs.centerChannelStylesHeader).toggleClass('open');
        this.toggleSection(this.refs.centerChannelStyles);
    }

    toggleLinkAndButtonStyles = (e) => {
        e.preventDefault();

        $(this.refs.linkAndButtonStylesHeader).toggleClass('open');
        this.toggleSection(this.refs.linkAndButtonStyles);
    }

    toggleSection(node) {
        if (UserAgent.isIos()) {
            // iOS doesn't support jQuery animations
            $(node).toggleClass('open');
        } else {
            $(node).slideToggle();
        }
    }

    onCodeThemeChange = (e) => {
        const theme = this.props.theme;
        theme.codeTheme = e.target.value;
        this.props.updateTheme(theme);
    }

    render() {
        const {formatMessage} = this.props.intl;
        const theme = this.props.theme;

        const sidebarElements = [];
        const centerChannelElements = [];
        const linkAndButtonElements = [];
        Constants.THEME_ELEMENTS.forEach((element, index) => {
            if (element.id === 'codeTheme') {
                const codeThemeOptions = [];
                let codeThemeURL = '';

                element.themes.forEach((codeTheme, codeThemeIndex) => {
                    if (codeTheme.id === theme[element.id]) {
                        codeThemeURL = codeTheme.iconURL;
                    }
                    codeThemeOptions.push(
                        <option
                            key={'code-theme-key' + codeThemeIndex}
                            value={codeTheme.id}
                        >
                            {codeTheme.uiName}
                        </option>
                    );
                });

                var popoverContent = (
                    <Popover
                        bsStyle='info'
                        id='code-popover'
                        className='code-popover'
                    >
                        <img
                            width='200'
                            src={codeThemeURL}
                        />
                    </Popover>
                );

                centerChannelElements.push(
                    <div
                        className='col-sm-6 form-group'
                        key={'custom-theme-key' + index}
                    >
                        <label className='custom-label'>{formatMessage(messages[element.id])}</label>
                        <div
                            className='input-group theme-group group--code dropdown'
                            id={element.id}
                        >
                            <select
                                className='form-control'
                                type='text'
                                defaultValue={theme[element.id]}
                            >
                                {codeThemeOptions}
                            </select>
                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                placement='top'
                                overlay={popoverContent}
                                ref='headerOverlay'
                            >
                                <span className='input-group-addon'>
                                    <img
                                        src={codeThemeURL}
                                    />
                                </span>
                            </OverlayTrigger>
                        </div>
                    </div>
                );
            } else if (element.group === 'centerChannelElements') {
                centerChannelElements.push(
                    <div
                        className='col-sm-6 form-group element'
                        key={'custom-theme-key' + index}
                    >
                        <ColorChooser
                            id={element.id}
                            label={formatMessage(messages[element.id])}
                            color={theme[element.id]}
                            onChange={this.handleColorChange}
                        />
                    </div>
                );
            } else if (element.group === 'sidebarElements') {
                // Need to support old typo mentionBj element for mentionBg
                let color = theme[element.id];
                if (!color && element.id === 'mentionBg') {
                    color = theme.mentionBj;
                }

                sidebarElements.push(
                    <div
                        className='col-sm-6 form-group element'
                        key={'custom-theme-key' + index}
                    >
                        <ColorChooser
                            id={element.id}
                            label={formatMessage(messages[element.id])}
                            color={color}
                            onChange={this.handleColorChange}
                        />
                    </div>
                );
            } else {
                linkAndButtonElements.push(
                    <div
                        className='col-sm-6 form-group element'
                        key={'custom-theme-key' + index}
                    >
                        <ColorChooser
                            id={element.id}
                            label={formatMessage(messages[element.id])}
                            color={theme[element.id]}
                            onChange={this.handleColorChange}
                        />
                    </div>
                );
            }
        });

        const pasteBox = (
            <div className='col-sm-12'>
                <label className='custom-label'>
                    <FormattedMessage
                        id='user.settings.custom_theme.copyPaste'
                        defaultMessage='Copy and paste to share theme colors:'
                    />
                </label>
                <textarea
                    ref='textarea'
                    className='form-control'
                    value={this.state.copyTheme}
                    onPaste={this.pasteBoxChange}
                    onChange={this.onChangeHandle}
                    onClick={this.selectTheme}
                />
            </div>
        );

        return (
            <div className='appearance-section padding-top'>
                <div className='theme-elements row'>
                    <div
                        ref='sidebarStylesHeader'
                        className='theme-elements__header'
                        onClick={this.toggleSidebarStyles}
                    >
                        <FormattedMessage
                            id='user.settings.custom_theme.sidebarTitle'
                            defaultMessage='Sidebar Styles'
                        />
                        <div className='header__icon'>
                            <i className='fa fa-plus'/>
                            <i className='fa fa-minus'/>
                        </div>
                    </div>
                    <div
                        ref='sidebarStyles'
                        className='theme-elements__body'
                    >
                        {sidebarElements}
                    </div>
                </div>
                <div className='theme-elements row'>
                    <div
                        ref='centerChannelStylesHeader'
                        className='theme-elements__header'
                        onClick={this.toggleCenterChannelStyles}
                    >
                        <FormattedMessage
                            id='user.settings.custom_theme.centerChannelTitle'
                            defaultMessage='Center Channel Styles'
                        />
                        <div className='header__icon'>
                            <i className='fa fa-plus'/>
                            <i className='fa fa-minus'/>
                        </div>
                    </div>
                    <div
                        ref='centerChannelStyles'
                        className='theme-elements__body'
                    >
                        {centerChannelElements}
                    </div>
                </div>
                <div className='theme-elements row form-group'>
                    <div
                        ref='linkAndButtonStylesHeader'
                        className='theme-elements__header'
                        onClick={this.toggleLinkAndButtonStyles}
                    >
                        <FormattedMessage
                            id='user.settings.custom_theme.linkButtonTitle'
                            defaultMessage='Link and Button Styles'
                        />
                        <div className='header__icon'>
                            <i className='fa fa-plus'/>
                            <i className='fa fa-minus'/>
                        </div>
                    </div>
                    <div
                        ref='linkAndButtonStyles'
                        className='theme-elements__body'
                    >
                        {linkAndButtonElements}
                    </div>
                </div>
                <div className='row'>
                    {pasteBox}
                </div>
            </div>
        );
    }
}

CustomThemeChooser.propTypes = {
    intl: intlShape.isRequired,
    theme: PropTypes.object.isRequired,
    updateTheme: PropTypes.func.isRequired
};

export default injectIntl(CustomThemeChooser);
