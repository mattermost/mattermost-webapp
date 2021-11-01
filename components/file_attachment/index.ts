// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {connect, ConnectedProps} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GenericAction, Action} from 'mattermost-redux/types/actions';

import {getFilesDropdownPluginMenuItems} from 'selectors/plugins';

import {GlobalState} from 'types/store';
import {ModalData} from 'types/actions';

import {openModal} from 'actions/views/modals';

import {canDownloadFiles} from 'utils/file_utils';

import FileAttachment from './file_attachment';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        canDownloadFiles: canDownloadFiles(config),
        enableSVGs: config.EnableSVGs === 'true',
        enablePublicLink: config.EnablePublicLink === 'true',
        pluginMenuItems: getFilesDropdownPluginMenuItems(state),
    };
}

type Actions = {
    openModal: <P>(modalData: ModalData<P>) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            openModal,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(FileAttachment);
