// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {FormattedMessage} from 'react-intl';

import PropTypes from 'prop-types';

import SaveButton from 'components/save_button';
import {localizeMessage} from 'utils/utils';
import BlockableLink from 'components/admin_console/blockable_link';

export default function SaveChangesPanel({saveNeeded, onClick, saving, serverError}) {
    return (
        <div className='admin-console-save'>
            <SaveButton
                saving={saving}
                disabled={!saveNeeded}
                onClick={onClick}
                savingMessage={localizeMessage('admin.team_settings.channel_detail.saving', 'Saving Config...')}
            />
            <BlockableLink
                className='cancel-button'
                to='/admin_console/user_management/teams'
            >
                <FormattedMessage
                    id='admin.team_settings.channel_detail.cancel'
                    defaultMessage='Cancel'
                />
            </BlockableLink>

            <div className='error-message'>
                {serverError}
            </div>
        </div>
    );
}

SaveChangesPanel.propTypes = {
    saving: PropTypes.bool.isRequired,
    saveNeeded: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    serverError: PropTypes.node,
};
