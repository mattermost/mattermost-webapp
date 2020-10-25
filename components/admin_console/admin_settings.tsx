// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';

import {AdminConfig, EnvironmentConfig} from 'mattermost-redux/types/config';

import {localizeMessage} from 'utils/utils.jsx';
import SaveButton from 'components/save_button';
import FormError from 'components/form_error';

import AdminHeader from 'components/widgets/admin_console/admin_header';

export type BaseProps = {
    config?: DeepPartial<AdminConfig>;
    environmentConfig?: EnvironmentConfig;
    setNavigationBlocked?: (blocked: boolean) => void;
    isDisabled?: boolean;
    updateConfig?: (config: AdminConfig) => {data: AdminConfig; error: ClientErrorPlaceholder};
}

export type BaseState = {
    saveNeeded: boolean;
    saving: boolean;
    serverError: string|null;
    serverErrorId?: string;
    errorTooltip: boolean;
}

type StateKeys = keyof BaseState;

// Placeholder type until ClientError is exported from redux.
// TODO: remove ClientErrorPlaceholder and change the return type of updateConfig
type ClientErrorPlaceholder = {
    message: string;
    server_error_id: string;
}

export default abstract class AdminSettings <Props extends BaseProps, State extends BaseState> extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        const stateInit = {
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
        };
        if (props.config) {
            this.state = Object.assign(this.getStateFromConfig(props.config), stateInit) as Readonly<State>;
        } else {
            this.state = stateInit as Readonly<State>;
        }
    }

    protected abstract getStateFromConfig(config: DeepPartial<AdminConfig>): Partial<State>;

    protected abstract getConfigFromState(config: DeepPartial<AdminConfig>): unknown;

    protected abstract renderTitle(): React.ReactElement;

    protected abstract renderSettings(): React.ReactElement;

    protected handleSaved?: ((config: AdminConfig) => React.ReactElement);

    protected canSave?: () => boolean;

    private closeTooltip = () => {
        this.setState({errorTooltip: false});
    }

    private openTooltip = (e: React.MouseEvent) => {
        const elm: HTMLElement|null = e.currentTarget.querySelector('.control-label');
        if (elm) {
            const isElipsis = elm.offsetWidth < elm.scrollWidth;
            this.setState({errorTooltip: isElipsis});
        }
    }

    protected handleChange = (id: string, value: boolean) => {
        this.setState((prevState) => ({
            ...prevState,
            saveNeeded: true,
            [id]: value,
        }));

        if (this.props.setNavigationBlocked) {
            this.props.setNavigationBlocked(true);
        }
    };

    private handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        this.doSubmit();
    }

    protected doSubmit = async (callback?: () => void) => {
        this.setState({
            saving: true,
            serverError: null,
        });

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        if (this.props.updateConfig) {
            const {data, error} = await this.props.updateConfig(config);

            if (data) {
                this.setState(this.getStateFromConfig(data) as State);

                this.setState({
                    saveNeeded: false,
                    saving: false,
                });

                if (this.props.setNavigationBlocked) {
                    this.props.setNavigationBlocked(false);
                }

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            } else if (error) {
                this.setState({
                    saving: false,
                    serverError: error.message,
                    serverErrorId: error.server_error_id,
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            }
        }
    };

    private parseInt = (str: string, defaultValue?: number) => {
        const n = parseInt(str, 10);

        if (isNaN(n)) {
            if (defaultValue) {
                return defaultValue;
            }
            return 0;
        }

        return n;
    };

    private parseIntNonNegative = (str: string, defaultValue?: number) => {
        const n = parseInt(str, 10);

        if (isNaN(n) || n < 0) {
            if (defaultValue) {
                return defaultValue;
            }
            return 0;
        }

        return n;
    };

    private parseIntZeroOrMin = (str: string, minimumValue = 1) => {
        const n = parseInt(str, 10);

        if (isNaN(n) || n < 0) {
            return 0;
        }
        if (n > 0 && n < minimumValue) {
            return minimumValue;
        }

        return n;
    };

    protected parseIntNonZero = (str: string, defaultValue?: number, minimumValue = 1) => {
        const n = parseInt(str, 10);

        if (isNaN(n) || n < minimumValue) {
            if (defaultValue) {
                return defaultValue;
            }
            return 1;
        }

        return n;
    };

    private getConfigValue(config: AdminConfig | EnvironmentConfig, path: string) {
        const pathParts = path.split('.');

        // eslint-disable-next-line @typescript-eslint/ban-types
        return pathParts.reduce((obj: object | null, pathPart) => {
            if (!obj) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/ban-types
            return obj[(pathPart as keyof object)];
        }, config);
    }

    private setConfigValue(config: AdminConfig, path: string, value: any) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        function setValue(obj: object, pathParts: string[]) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            const part = pathParts[0] as keyof object;

            if (pathParts.length === 1) {
                Object.assign(obj, {[part]: value});
            } else {
                if (obj[part] == null) {
                    Object.assign(obj, {[part]: {}});
                }

                setValue(obj[part], pathParts.slice(1));
            }
        }

        setValue(config, path.split('.'));
    }

    protected isSetByEnv = (path: string) => {
        return Boolean(this.props.environmentConfig && this.getConfigValue(this.props.environmentConfig!, path));
    };

    public render() {
        return (
            <form
                className='form-horizontal'
                role='form'
                onSubmit={this.handleSubmit}
            >
                <div className='wrapper--fixed'>
                    <AdminHeader>
                        {this.renderTitle()}
                    </AdminHeader>
                    {this.renderSettings()}
                    <div className='admin-console-save'>
                        <SaveButton
                            saving={this.state.saving}
                            disabled={this.props.isDisabled || !this.state.saveNeeded || (this.canSave && !this.canSave())}
                            onClick={this.handleSubmit}
                            savingMessage={localizeMessage('admin.saving', 'Saving Config...')}
                        />
                        <div
                            className='error-message'
                            ref='errorMessage'
                            onMouseOver={this.openTooltip}
                            onMouseOut={this.closeTooltip}
                        >
                            <FormError error={this.state.serverError}/>
                        </div>
                        <Overlay
                            show={this.state.errorTooltip}
                            placement='top'
                            target={this.refs.errorMessage}
                        >
                            <Tooltip id='error-tooltip' >
                                {this.state.serverError}
                            </Tooltip>
                        </Overlay>
                    </div>
                </div>
            </form>
        );
    }
}

/* eslint-enable react/no-string-refs */
