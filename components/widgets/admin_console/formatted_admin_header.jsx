// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import AdminHeader from 'components/widgets/admin_console/admin_header.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

const FormattedAdminHeader = (props) => (
    <AdminHeader>
        <FormattedMarkdownMessage
            id={props.id}
            defaultMessage={props.defaultMessage}
            values={props.values}
        />
    </AdminHeader>
);

FormattedAdminHeader.propTypes = {
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    values: PropTypes.object,
};

FormattedAdminHeader.defaultProps = {
    values: {},
};

export default FormattedAdminHeader;
