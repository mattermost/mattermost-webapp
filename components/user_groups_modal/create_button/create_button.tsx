import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';
import CreateUserGroupsModal from 'components/create_user_groups_modal';

type Props = {
    onExited: () => void;
    openModal: <P>(modalData: ModalData<P>) => void;
    backButtonCallback: () => void;
}

const CreateButton = (props: Props) => {
    const goToCreateModal = () => {
        props.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
            dialogProps: {
                backButtonCallback: props.backButtonCallback,
            },
        });

        props.onExited();
    }

    return (
        <a
            id='test'
            className='user-groups-create btn btn-md btn-primary'
            href='#'
            onClick={goToCreateModal}
        >
            <FormattedMessage
                id='user_groups_modal.createNew'
                defaultMessage='Create Group'
            />
        </a>
    );
};

export default CreateButton;