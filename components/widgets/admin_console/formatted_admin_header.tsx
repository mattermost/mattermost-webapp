// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import AdminHeader from './admin_header';

type Props = {
    id: string,
    defaultMessage: string,
    values?: any,
};

const FormattedAdminHeader = (props:Props) => (
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
