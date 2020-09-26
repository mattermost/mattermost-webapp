// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting';
import {browserHistory} from 'utils/browser_history';
import Textbox from 'components/textbox';
import ViewImageModal from 'components/view_image';
import ProfilePicture from 'components/profile_picture';
import EmojiPicker from 'components/emoji_picker';

import Badge from 'components/widgets/badges/badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import InfoIcon from 'components/widgets/icons/info_icon';
import MenuIcon from 'components/widgets/icons/menu_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import FileSearchResultItem from 'components/file_search_results/file_search_result_item';

// The following import has intentional side effects. Do not remove without research.
import {openInteractiveDialog} from './interactive_dialog';

// Common libraries exposed on window for plugins to use as Webpack externals.
window.React = require('react');
window.ReactDOM = require('react-dom');
window.Redux = require('redux');
window.ReactRedux = require('react-redux');
window.ReactBootstrap = require('react-bootstrap');
window.ReactRouterDom = require('react-router-dom');
window.PropTypes = require('prop-types');
window.PDFJS = require('pdfjs-dist');

// Functions and components exposed on window for plugins to use.
window.PostUtils = {formatText, messageHtmlToComponent};
window.openInteractiveDialog = openInteractiveDialog;
window.WebappUtils = {browserHistory};
window.Components = {Textbox, ViewImageModal, InfoIcon, MenuIcon, Menu, MenuWrapper, Badge, BotBadge, GuestBadge, ProfilePicture, EmojiPicker, FileSearchResultItem};
