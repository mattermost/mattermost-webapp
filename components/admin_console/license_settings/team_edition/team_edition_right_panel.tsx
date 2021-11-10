// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';
import {FormattedMessage} from 'react-intl';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {localizeMessage} from 'utils/utils';
import {format} from 'utils/markdown';

interface TeamEditionRightPanelProps {
    upgradingPercentage: number;
    handleUpgrade: (e: any) => Promise<void>;
    upgradeError: string | null;
    restartError: string | null;

    handleRestart: (e: any) => Promise<void>;

    restarting: boolean;
}

const TeamEditionRightPanel: React.FC<TeamEditionRightPanelProps> = ({
    upgradingPercentage,
    handleUpgrade,
    upgradeError,
    restartError,
    handleRestart,
    restarting,
}: TeamEditionRightPanelProps) => {
    let upgradeButton = null;
    if (upgradingPercentage !== 100) {
        upgradeButton = (
            <div>
                <p>
                    <button
                        type='button'
                        onClick={handleUpgrade}
                        className='btn btn-primary'
                    >
                        <LoadingWrapper
                            loading={upgradingPercentage > 0}
                            text={
                                <FormattedMessage
                                    id='admin.license.enterprise.upgrading'
                                    defaultMessage='Upgrading {percentage}%'
                                    values={{percentage: upgradingPercentage}}
                                />
                            }
                        >
                            <FormattedMessage
                                id='admin.license.enterprise.upgrade'
                                defaultMessage='Upgrade to Enterprise Edition'
                            />
                        </LoadingWrapper>
                    </button>
                </p>
                <p className='upgrade-legal-terms'>
                    <FormattedMarkdownMessage
                        id='admin.license.enterprise.upgrade.accept-terms'
                        defaultMessage='By clicking **Upgrade to Enterprise Edition**, I agree to the terms of the Mattermost Enterprise Edition License.'
                    />
                </p>
                {upgradeError && (
                    <div className='col-sm-12'>
                        <div className='form-group has-error'>
                            <label className='control-label'>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: format(upgradeError),
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    if (upgradingPercentage === 100) {
        upgradeButton = (
            <div>
                <p>
                    <FormattedMarkdownMessage
                        id='admin.license.upgraded-restart'
                        defaultMessage='You have upgraded your binary to mattermost enterprise, please restart the server to start using the new binary. You can do it right here:'
                    />
                </p>
                <p>
                    <button
                        type='button'
                        onClick={handleRestart}
                        className='btn btn-primary'
                    >
                        <LoadingWrapper
                            loading={restarting}
                            text={localizeMessage(
                                'admin.license.enterprise.restarting',
                                'Restarting',
                            )}
                        >
                            <FormattedMessage
                                id='admin.license.enterprise.restart'
                                defaultMessage='Restart Server'
                            />
                        </LoadingWrapper>
                        {restartError && (
                            <div className='col-sm-12'>
                                <div className='form-group has-error'>
                                    <label className='control-label'>
                                        {restartError}
                                    </label>
                                </div>
                            </div>
                        )}
                    </button>
                </p>
            </div>
        );
    }

    return upgradeButton;
};

export default React.memo(TeamEditionRightPanel);
