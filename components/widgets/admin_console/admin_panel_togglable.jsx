// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import AccordionToggleIcon from 'components/widgets/icons/accordion_toggle_icon.jsx';

import AdminPanel from './admin_panel.jsx';

const AdminPanelTogglable = (props) => {
    return (
        <AdminPanel
            className={'AdminPanelTogglable ' + props.className + (props.open ? '' : ' closed')}
            id={props.id}
            titleId={props.titleId}
            titleDefault={props.titleDefault}
            subtitleId={props.subtitleId}
            subtitleDefault={props.subtitleDefault}
            onHeaderClick={props.onToggle}
            button={<AccordionToggleIcon/>}
        >
            {props.children}
        </AdminPanel>
    );
};

AdminPanelTogglable.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string.isRequired,
    id: PropTypes.string,
    open: PropTypes.bool.isRequired,
    titleId: PropTypes.string.isRequired,
    titleDefault: PropTypes.string.isRequired,
    subtitleId: PropTypes.string.isRequired,
    subtitleDefault: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
};

AdminPanelTogglable.defaultProps = {
    className: '',
    open: true,
};

export default AdminPanelTogglable;
