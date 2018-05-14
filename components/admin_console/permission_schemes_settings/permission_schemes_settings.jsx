// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

export default class PermissionSchemesSettings extends React.PureComponent {
    renderTitle() {
        return (
            <FormattedMessage
                id='admin.permissions.permissionSchemes'
                defaultMessage='Permission Schemes'
            />
        );
    }

    render = () => {
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    {this.renderTitle()}
                </h3>

                <div className={'banner info'}>
                    <div className='banner__content'>
                        <span>
                            <FormattedMessage
                                id='admin.permissions.introBanner'
                                defaultMessage='Permission Schemes set the default permissions for Team Admins, Channel Admins and everyone else. Learn more about permission schemes in our documentation.'
                            />
                        </span>
                    </div>
                </div>

                <div className='permissions-block'>
                    <div className='header'>
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.systemSchemeBannerTitle'
                                    defaultMessage='System Scheme'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.systemSchemeBannerText'
                                    defaultMessage='Set the default permissions inherited by all teams unless a Team Override Scheme is applied.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <Link
                                className='btn btn-primary'
                                to='/admin_console/permissions/system-scheme'
                            >
                                <FormattedMessage
                                    id='admin.permissions.systemSchemeBannerButton'
                                    defaultMessage='Edit Scheme'
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}
