// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Tabs, Tab, SelectCallback} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import debounce from 'lodash/debounce';

import {MagnifyIcon} from '@mattermost/compass-icons/components';

import {FooterPagination} from '@mattermost/components';
import {getPluginStatuses} from 'mattermost-redux/actions/admin';
import {setFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/actions/general';
import {getFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/selectors/entities/general';
import {ActionResult} from 'mattermost-redux/types/actions';

import {fetchListing, filterListing} from 'actions/marketplace';
import {trackEvent} from 'actions/telemetry_actions.jsx';
import {closeModal} from 'actions/views/modals';

import GenericModal from 'components/generic_modal';
import LoadingScreen from 'components/loading_screen';
import Input, {SIZE} from 'components/widgets/inputs/input/input';

import {getListing, getInstalledListing} from 'selectors/views/marketplace';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

import './marketplace_modal.scss';

import MarketplaceList, {ITEMS_PER_PAGE} from './marketplace_list/marketplace_list';

const MarketplaceTabs = {
    ALL_LISTING: 'all',
    INSTALLED_LISTING: 'installed',
};

const SEARCH_TIMEOUT_MILLISECONDS = 200;

const linkConsole = (msg: string) => (
    <Link to='/admin_console/plugins/plugin_management'>
        {msg}
    </Link>
);

const MarketplaceModal = () => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const listRef = useRef<HTMLDivElement>(null);

    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.PLUGIN_MARKETPLACE));
    const listing = useSelector(getListing);
    const installedListing = useSelector(getInstalledListing);
    const pluginStatuses = useSelector((state: GlobalState) => state.entities.admin.pluginStatuses);
    const firstAdminVisitMarketplaceStatus = useSelector(getFirstAdminVisitMarketplaceStatus);

    const [tabKey, setTabKey] = useState(MarketplaceTabs.ALL_LISTING);
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(0);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [loading, setLoading] = React.useState(true);
    const [serverError, setServerError] = React.useState(false);

    const doFetchListing = useCallback(async () => {
        const {error} = await dispatch(fetchListing()) as ActionResult;

        if (error) {
            setServerError(true);
        }

        setLoading(false);
    }, []);

    const doSearch = useCallback(async () => {
        trackEvent('plugins', 'ui_marketplace_search', {filter});

        const {error} = await dispatch(filterListing(filter)) as ActionResult;

        if (error) {
            setServerError(true);
        }
    }, [filter]);

    const debouncedSearch = debounce(doSearch, SEARCH_TIMEOUT_MILLISECONDS);

    useEffect(() => {
        async function doFetch() {
            await dispatch(getPluginStatuses());
            await doFetchListing();
            setHasLoaded(true);
        }

        trackEvent('plugins', 'ui_marketplace_opened');

        if (firstAdminVisitMarketplaceStatus) {
            trackEvent('plugins', 'ui_first_admin_visit_marketplace_status');
            dispatch(setFirstAdminVisitMarketplaceStatus());
        }

        doFetch();
    }, []);

    useEffect(() => {
        if (hasLoaded) {
            doFetchListing();
        }
    }, [pluginStatuses]);

    useEffect(() => {
        if (hasLoaded) {
            debouncedSearch();
        }
    }, [filter]);

    const scrollListToTop = useCallback(() => {
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    }, []);

    const handleOnClose = () => {
        trackEvent('plugins', 'ui_marketplace_closed');
        dispatch(closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE));
    };

    const handleChangeTab: SelectCallback = useCallback((tabKey) => {
        setTabKey(tabKey);
        setPage(0);
        scrollListToTop();
    }, [scrollListToTop]);

    const handleOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    }, []);

    const handleOnClear = useCallback(() => {
        setFilter('');
    }, []);

    const handleOnNextPage = useCallback(() => {
        setPage(page + 1);
        scrollListToTop();
    }, [page, scrollListToTop]);

    const handleOnPreviousPage = useCallback(() => {
        setPage(page - 1);
        scrollListToTop();
    }, [page, scrollListToTop]);

    const handleNoResultsButtonClick = useCallback(() => {
        handleChangeTab(MarketplaceTabs.ALL_LISTING);
    }, [handleChangeTab]);

    const getHeaderInput = useCallback(() => (
        <Input
            id='searchMarketplaceTextbox'
            name='searchMarketplaceTextbox'
            containerClassName='marketplace-modal-search'
            inputClassName='search_input'
            type='text'
            inputSize={SIZE.LARGE}
            inputPrefix={<MagnifyIcon size={24}/>}
            placeholder={formatMessage({id: 'marketplace_modal.search', defaultMessage: 'Search marketplace'})}
            useLegend={false}
            autoFocus={true}
            clearable={true}
            value={filter}
            onChange={handleOnChange}
            onClear={handleOnClear}
        />
    ), [filter, handleOnChange, handleOnClear]);

    const getFooterContent = useCallback(() => (
        <FooterPagination
            page={page}
            total={tabKey === MarketplaceTabs.ALL_LISTING ? listing.length : installedListing.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onNextPage={handleOnNextPage}
            onPreviousPage={handleOnPreviousPage}
        />
    ), [installedListing.length, listing.length, page, handleOnNextPage, handleOnPreviousPage, tabKey]);

    return (
        <GenericModal
            id='marketplace-modal'
            className='marketplace-modal'
            modalHeaderText={formatMessage({id: 'marketplace_modal.title', defaultMessage: 'App Marketplace'})}
            ariaLabel={formatMessage({id: 'marketplace_modal.title', defaultMessage: 'App Marketplace'})}
            errorText={serverError ? (
                formatMessage(
                    {
                        id: 'marketplace_modal.app_error',
                        defaultMessage: 'Error connecting to the marketplace server. Please check your settings in the <linkConsole>System Console</linkConsole>.',
                    },
                    {linkConsole},
                )
            ) : undefined}
            show={show}
            compassDesign={true}
            bodyPadding={false}
            footerDivider={true}
            onExited={handleOnClose}
            footerContent={getFooterContent()}
            headerInput={getHeaderInput()}
        >
            <Tabs
                id='marketplaceTabs'
                className='tabs'
                defaultActiveKey={MarketplaceTabs.ALL_LISTING}
                activeKey={tabKey}
                onSelect={handleChangeTab}
                unmountOnExit={true}
            >
                <Tab
                    eventKey={MarketplaceTabs.ALL_LISTING}
                    title={formatMessage({id: 'marketplace_modal.tabs.all_listing', defaultMessage: 'All'})}
                >
                    {loading ? (
                        <LoadingScreen className='loading'/>
                    ) : (
                        <MarketplaceList
                            listRef={listRef}
                            listing={listing}
                            page={page}
                            filter={filter}
                            noResultsMessage={formatMessage({id: 'marketplace_modal.no_plugins', defaultMessage: 'No plugins found'})}
                        />
                    )}
                </Tab>
                <Tab
                    eventKey={MarketplaceTabs.INSTALLED_LISTING}
                    title={formatMessage(
                        {id: 'marketplace_modal.tabs.installed_listing', defaultMessage: 'Installed ({count})'},
                        {count: installedListing.length},
                    )}
                >
                    <MarketplaceList
                        listRef={listRef}
                        listing={installedListing}
                        page={page}
                        filter={filter}
                        noResultsMessage={formatMessage({
                            id: 'marketplace_modal.no_plugins_installed',
                            defaultMessage: 'No plugins installed found',
                        })}
                        noResultsAction={{
                            label: formatMessage({id: 'marketplace_modal.install_plugins', defaultMessage: 'Install plugins'}),
                            onClick: handleNoResultsButtonClick,
                        }}
                    />
                </Tab>
            </Tabs>
        </GenericModal>
    );
};

export default MarketplaceModal;
