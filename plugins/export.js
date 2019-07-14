// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting.jsx';

import {openInteractiveDialog} from './interactive_dialog';

// Common libraries exposed on window for plugins to use as Webpack externals.
window.React = require('react');
window.ReactDOM = require('react-dom');
window.Redux = require('redux');
window.ReactRedux = require('react-redux');
window.ReactBootstrap = require('react-bootstrap');
window.PostUtils = {formatText, messageHtmlToComponent};
window.PropTypes = require('prop-types');
window.PDFJS = require('pdfjs-dist');
window.openInteractiveDialog = openInteractiveDialog;
