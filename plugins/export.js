// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {bindActionCreators} from 'redux';

import store from 'stores/redux_store.jsx';

import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting.jsx';
import {showPluginRHS} from 'actions/views/rhs';

// Common libraries exposed on window for plugins to use as Webpack externals.
window.React = require('react');
window.ReactDOM = require('react-dom');
window.Redux = require('redux');
window.ReactRedux = require('react-redux');
window.ReactBootstrap = require('react-bootstrap');
window.PostUtils = {formatText, messageHtmlToComponent};
window.PropTypes = require('prop-types');
window.PDFJS = require('pdfjs-dist');
window.rhsPluginAction = bindActionCreators({showPluginRHS}, store.dispatch);
