// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageHtmlToComponent from 'utils/message_html_to_component';
import {formatText} from 'utils/text_formatting';
import {browserHistory} from 'utils/browser_history';

import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {imageURLForUser} from 'utils/utils.jsx';

import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelMembersModal from 'components/channel_members_modal';
import PurchaseModal from 'components/purchase_modal';
import Timestamp from 'components/timestamp';
import Avatar from 'components/widgets/users/avatar';

import Textbox from './textbox';

// The following import has intentional side effects. Do not remove without research.
import {openInteractiveDialog} from './interactive_dialog';

// Common libraries exposed on window for plugins to use as Webpack externals.
window.React = require('react');
window.ReactDOM = require('react-dom');
window.ReactIntl = require('react-intl');
window.Redux = require('redux');
window.ReactRedux = require('react-redux');
window.ReactBootstrap = require('react-bootstrap');
window.ReactRouterDom = require('react-router-dom');
window.PropTypes = require('prop-types');
window.PDFJS = require('pdfjs-dist');
window.Luxon = require('luxon');

// Functions exposed on window for plugins to use.
window.PostUtils = {formatText, messageHtmlToComponent};
window.openInteractiveDialog = openInteractiveDialog;
window.WebappUtils = {
    browserHistory,
    modals: {openModal, ModalIdentifiers},
};

// Components exposed on window FOR INTERNAL PLUGIN USE ONLY. These components may have breaking changes in the future
// outside of major releases. They will be replaced by common components once that project is more mature and able to
// guarantee better compatibility.
window.Components = {
    Textbox,
    PurchaseModal,
    Timestamp,
    ChannelInviteModal,
    ChannelMembersModal,
    Avatar,
    imageURLForUser,
};
