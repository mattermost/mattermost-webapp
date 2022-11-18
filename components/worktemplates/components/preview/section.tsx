// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import classnames from 'classnames';

import {useSelector} from 'react-redux';

import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import './section.scss';

interface GenericPreviewSectionProps {
    items: Array<{id: string; name?: string; illustration?: string}>;
    onUpdateIllustration?: (illustration: string) => void;
    className?: string;
    message?: string;
    id?: string;
}

type IntegrationPreviewSectionItemsProps = {id: string; name?: string; category?: string; description?: string; icon?: string; installed?: boolean}
interface IntegrationPreviewSectionProps {
    items: IntegrationPreviewSectionItemsProps[];
    className?: string;
    message?: string;
    id?: string;
}

const viewIntegrations = (props: GenericPreviewSectionProps | IntegrationPreviewSectionProps) => {
    if (props.id === 'integrations') {
        const integrationsProps = props as IntegrationPreviewSectionProps;
        return (
            <IntegrationsPreview
                items={integrationsProps.items}
            />);
    }
    const genericProps = props as GenericPreviewSectionProps;
    return (
        <GenericPreview
            items={props.items}
            onUpdateIllustration={genericProps.onUpdateIllustration}
        />);
};

const PreviewSection = (props: GenericPreviewSectionProps | IntegrationPreviewSectionProps) => {
    const {formatMessage} = useIntl();
    return (
        <div className={props.className}>
            <p>
                {props.message}
            </p>
            <span className='included-title'>{formatMessage({id: 'worktemplates.preview.section.included', defaultMessage: 'Included'})}</span>
            { viewIntegrations(props) }

        </div>
    );
};

const IntegrationsPreview = ({items}: IntegrationPreviewSectionProps) => {
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const {formatMessage} = useIntl();

    const createWarningMessage = () => {
        const uninstalledPlugins = items.reduce((acc: IntegrationPreviewSectionItemsProps[], curr: IntegrationPreviewSectionItemsProps) => {
            if (!curr.installed) {
                return [
                    ...acc,
                    curr,
                ];
            }
            return acc;
        }, [] as IntegrationPreviewSectionItemsProps[]);

        if (uninstalledPlugins.length === 1) {
            return formatMessage(
                {
                    id: 'worktemplates.preview.integrations.admin_install.single_plugin',
                    defaultMessage: '{plugin} will not be added until admin installs it.',
                },
                {
                    plugin: uninstalledPlugins[0].name,
                });
        } else if (uninstalledPlugins.length > 1) {
            return formatMessage({id: 'worktemplates.preview.integrations.admin_install.multiple_plugin', defaultMessage: 'Integrations will not be added until admin installs them.'});
        }
        return '';
    };
    const warningMessage = isAdmin ? '' : createWarningMessage();

    return (
        <div className='preview-integrations'>
            <div className='preview-integrations-plugins'>
                {items.map((item) => {
                    return (
                        <div
                            key={item.id}
                            className={classnames('preview-integrations-plugins-item', {'preview-integrations-plugins-item__uninstalled': !item.installed && !isAdmin})}
                        >
                            <div className='preview-integrations-plugins-item__icon'>
                                <img src={item.icon}/>
                            </div>
                            <div className='preview-integrations-plugins-item__name'>
                                {item.name}
                            </div>
                            {item.installed && <div className='icon-check-circle preview-integrations-plugins-item__icon_blue'/>}
                            {!item.installed && <div className='icon-download-outline'/>}
                        </div>);
                })}
            </div>
            { warningMessage && <div className='preview-integrations-warning'>
                <div className='icon-alert-outline'/>
                <div className='preview-integrations-warning-message'> {warningMessage} </div>
            </div>}
        </div>

    );
};

const GenericPreview = ({items, onUpdateIllustration}: GenericPreviewSectionProps) => {
    const updateIllustration = (e: React.MouseEvent<HTMLAnchorElement>, illustration: string) => {
        e.preventDefault();
        onUpdateIllustration?.(illustration);
    };

    return (<ul>
        {items.map((c) => (
            <li key={c.id}>
                <a
                    href='#'
                    onClick={(e) => updateIllustration(e, c.illustration || '')}
                >
                    {c.name}
                </a>
            </li>
        ))}
    </ul>);
};

export default PreviewSection;
