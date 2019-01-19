// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting.jsx';
import {Section, SectionHeader, SectionItem, SectionItemLink} from 'components/sidebar/section';
import CenterChannel from 'components/channel_layout/center_channel';
import PostView from 'components/post_view';

// Common libraries exposed on window for plugins to use as Webpack externals.
window.React = require('react');
window.ReactDOM = require('react-dom');
window.Redux = require('redux');
window.ReactRedux = require('react-redux');
window.ReactBootstrap = require('react-bootstrap');
window.PostUtils = {formatText, messageHtmlToComponent};
window.PropTypes = require('prop-types');

window.Section = Section;
window.SectionHeader = SectionHeader;
window.SectionItem = SectionItem;
window.SectionItemLink = SectionItemLink;
window.CenterChannel = CenterChannel;
window.PostView = PostView;
