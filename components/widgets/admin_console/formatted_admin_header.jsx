// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import React from 'react';

import AdminHeader from 'components/widgets/admin_console/admin_header.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

type Props = {|
    id: string,
    defaultMessage: string,
    values: {[string]: mixed},
|};

const FormattedAdminHeader = (props: Props) => (
    <AdminHeader>
        <FormattedMarkdownMessage
            id={props.id}
            defaultMessage={props.defaultMessage}
            values={props.values}
        />
    </AdminHeader>
);

FormattedAdminHeader.defaultProps = {
    values: {},
};

export default FormattedAdminHeader;
