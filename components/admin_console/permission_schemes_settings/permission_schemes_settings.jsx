// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import PermissionsSchemeSummary from './permissions_scheme_summary';

export default class PermissionSchemesSettings extends React.PureComponent {
    static propTypes = {
        schemes: PropTypes.array.isRequired,
        actions: PropTypes.shape({
            loadSchemes: PropTypes.func.isRequired,
        }),
    };

    static defaultProps = {
        schemes: [],
    };

    componentDidMount() {
        this.props.actions.loadSchemes('team');
    }

    render = () => {
        const schemes = Object.values(this.props.schemes).map((scheme) => (<PermissionsSchemeSummary
            scheme={scheme}
            key={scheme.id}
                                                                           />));

        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.permissions.permissionSchemes'
                        defaultMessage='Permission Schemes'
                    />
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

                <div className='permissions-block'>
                    <div className='header'>
                        <div>
                            <h3>
                                <FormattedMessage
                                    id='admin.permissions.teamOverrideSchemesTitle'
                                    defaultMessage='Team Override Schemes'
                                />
                            </h3>
                            <span>
                                <FormattedMessage
                                    id='admin.permissions.teamOverrideSchemesBannerText'
                                    defaultMessage='Use when specific teams need permission exceptions to the System Scheme.'
                                />
                            </span>
                        </div>
                        <div className='button'>
                            <Link
                                className='btn btn-primary'
                                to='/admin_console/permissions/team-override-scheme'
                            >
                                <FormattedMessage
                                    id='admin.permissions.teamOverrideSchemesNewButton'
                                    defaultMessage='New Team Override Scheme'
                                />
                            </Link>
                        </div>
                    </div>
                    {schemes.length === 0 &&
                        <div className='no-team-schemes'>
                            <FormattedMessage
                                id='admin.permissions.teamOverrideSchemesNoSchemes'
                                defaultMessage='No team schemes found.'
                            />
                        </div> }
                    {schemes.length > 0 && schemes}
                </div>
            </div>
        );
    };
}
