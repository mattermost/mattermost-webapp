// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Constants, {EventTypes, A11yClassNames, A11yAttributeNames, A11yCustomEventTypes} from 'utils/constants.jsx';
import {isKeyPressed, cmdOrCtrlPressed, isMac} from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';

const listenerOptions = {
    capture: true,
};

export default class A11yController {
    constructor() {
        this.regionHTMLCollection = this.getAllRegions();
        this.sectionHTMLCollection = null;

        this.modalHTMLCollection = this.getAllModals();
        this.popupHTMLCollection = this.getAllPopups();

        this.activeRegion = null;
        this.activeSection = null;
        this.activeElement = null;

        this.a11yKeyEngaged = false;

        // used to reset navigation whenever navigation within a region occurs (section or element)
        this.resetNavigation = false;

        document.addEventListener(EventTypes.KEY_DOWN, this.handleKeyDown, listenerOptions);
        document.addEventListener(EventTypes.KEY_UP, this.handleKeyUp, listenerOptions);
        document.addEventListener(EventTypes.CLICK, this.handleMouseClick, listenerOptions);
        document.addEventListener(EventTypes.FOCUS, this.handleFocus, listenerOptions);
    }

    destroy() {
        this.clearActiveRegion();
        this.clearCurrentFocus();

        document.removeEventListener(EventTypes.KEY_DOWN, this.handleKeyDown, listenerOptions);
        document.removeEventListener(EventTypes.KEY_UP, this.handleKeyUp, listenerOptions);
        document.removeEventListener(EventTypes.CLICK, this.handleMouseClick, listenerOptions);
        document.removeEventListener(EventTypes.FOCUS, this.handleFocus, listenerOptions);
    }

    // convenience getter/setters

    /**
     * Returns an array of available regions sorted by A11yAttributeNames.SORT_ORDER
     */
    get regions() {
        let domElements = this.sortElementsByAttributeOrder(this.regionHTMLCollection);
        domElements = domElements.filter((element) => {
            return this.elementIsVisible(element);
        });
        return domElements;
    }

    /**
     * Returns an array of available sections sorted by A11yAttributeNames.SORT_ORDER and optionally reversed
     */
    get sections() {
        let domElements = this.sortElementsByAttributeOrder(this.sectionHTMLCollection);
        domElements = domElements.filter((element) => {
            return this.elementIsVisible(element);
        });
        if (this.reverseSections) {
            domElements.reverse();
        }
        return domElements;
    }

    get navInProgress() {
        return this.regions && this.regions.length && this.activeRegion && !this.modalIsOpen && !this.popupIsOpen;
    }

    get activeRegionIndex() {
        if (!this.activeRegion) {
            return null;
        }
        return this.regions.indexOf(this.activeRegion);
    }

    get activeSectionIndex() {
        if (!this.activeSection) {
            return null;
        }
        return this.sections.indexOf(this.activeSection);
    }

    get reverseSections() {
        if (!this.activeRegion) {
            return false;
        }
        return this.getOrderReverseAttribute(this.activeRegion);
    }

    get focusedElement() {
        let focusedElement;
        if (this.activeElement) {
            focusedElement = this.activeElement;
        } else if (this.activeSection) {
            focusedElement = this.activeSection;
        } else if (this.activeRegion) {
            focusedElement = this.activeRegion;
        }
        return focusedElement;
    }

    get modalIsOpen() {
        return this.modalHTMLCollection.length > 0;
    }

    get popupIsOpen() {
        return this.popupHTMLCollection.length > 0;
    }

    // public methods

    nextRegion() {
        const regions = this.regions;
        if (this.modalIsOpen || this.popupIsOpen || !regions || !regions.length) {
            return;
        }
        let newRegion;
        if (!this.activeRegion || this.activeRegionIndex === regions.length - 1 || (this.resetNavigation)) {
            newRegion = regions[0];
        } else {
            newRegion = regions[this.activeRegionIndex + 1];
        }
        this.setActiveRegion(newRegion);
        this.setCurrentFocus();
        this.resetNavigation = false;
    }

    previousRegion() {
        const regions = this.regions;
        if (this.modalIsOpen || this.popupIsOpen || !regions || !regions.length) {
            return;
        }
        let newRegion;
        if (!this.activeRegion || (this.resetNavigation && this.activeRegionIndex !== 0)) {
            newRegion = regions[0];
        } else if (this.activeRegionIndex === 0) {
            newRegion = regions[regions.length - 1];
        } else {
            newRegion = regions[this.activeRegionIndex - 1];
        }
        this.setActiveRegion(newRegion);
        this.setCurrentFocus();
        this.resetNavigation = false;
    }

    nextSection() {
        const sections = this.sections;
        const loopNavigation = this.getLoopNavigationAttribute(this.activeRegion);
        if (this.modalIsOpen || this.popupIsOpen || !sections || !sections.length || (!loopNavigation && this.activeSectionIndex === sections.length - 1)) {
            return;
        }
        let newSection;
        if (this.activeSection && this.activeSectionIndex < sections.length - 1) {
            newSection = sections[this.activeSectionIndex + 1];
        } else {
            newSection = sections[0];
        }
        this.setActiveSection(newSection);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    previousSection() {
        const sections = this.sections;
        const loopNavigation = this.getLoopNavigationAttribute(this.activeRegion);
        if (this.modalIsOpen || this.popupIsOpen || !sections || !sections.length || (!loopNavigation && this.activeSectionIndex === 0)) {
            return;
        }
        let newSection;
        if (this.activeSection && this.activeSectionIndex > 0) {
            newSection = sections[this.activeSectionIndex - 1];
        } else if (this.activeSection && this.activeSectionIndex === 0) {
            newSection = sections[sections.length - 1];
        } else {
            newSection = sections[0];
        }
        this.setActiveSection(newSection);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    nextElement(element, elementPath = []) {
        if (elementPath && elementPath.length) {
            // is the current element in an active region?
            if (elementPath.indexOf(this.activeRegion) < 0) {
                const region = elementPath.find((pathElement) => {
                    if (!pathElement.classList) {
                        return false;
                    }
                    return pathElement.classList.contains(A11yClassNames.REGION);
                });
                if (region) {
                    this.setActiveRegion(region, false);
                }
            }

            // is the current element in an active section?
            if (elementPath.indexOf(this.activeSection) < 0) {
                const section = elementPath.find((pathElement) => {
                    if (!pathElement.classList) {
                        return false;
                    }
                    return pathElement.classList.contains(A11yClassNames.SECTION);
                });
                if (section) {
                    this.setActiveSection(section);
                }
            }
        }
        this.setActiveElement(element);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    cancelNavigation() {
        this.clearActiveRegion();
        this.setCurrentFocus();
    }

    // private methods

    setActiveRegion(element, focusChildIfNeeded = true) {
        if ((!element || element === this.activeRegion) && !this.resetNavigation) {
            return;
        }

        // clear previous active region
        this.clearActiveRegion();

        // setup new active region
        this.activeRegion = element;
        this.activeRegion.addEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveRegionUpdate);
        this.activeRegion.dispatchEvent(new Event(A11yCustomEventTypes.ACTIVATE));

        // apply visual updates to active region
        this.updateActiveRegion();

        // retrieve all sections for the new active region
        this.sectionHTMLCollection = this.getAllSectionsForRegion(this.activeRegion);

        // should the visual focus start on a child section
        if (focusChildIfNeeded && this.getFocusChildAttribute(this.activeRegion) && this.sections && this.sections.length) {
            this.setActiveSection(this.sections[0]);
        }
    }

    setActiveSection(element) {
        if (!element || element === this.activeSection) {
            return;
        }

        // clear previous active section
        this.clearActiveSection();

        // setup new active section
        this.activeSection = element;
        this.activeSection.addEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveSectionUpdate);
        this.activeSection.dispatchEvent(new Event(A11yCustomEventTypes.ACTIVATE));

        // apply visual updates to active section
        this.updateActiveSection();
    }

    setActiveElement(element) {
        if (!element || element === this.activeElement) {
            return;
        }

        // clear previous active element
        this.clearActiveElement();

        // setup new active element
        this.activeElement = element;
        this.activeElement.addEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveElementUpdate);
        this.activeElement.dispatchEvent(new Event(A11yCustomEventTypes.ACTIVATE));

        // apply visual updates to active element
        this.updateActiveElement();
    }

    setCurrentFocus() {
        this.clearCurrentFocus();
        if (!this.focusedElement) {
            return;
        }

        if (document.activeElement !== this.focusedElement) {
            this.focusedElement.focus();
        }

        // apply visual updates to focused element
        this.udpateCurrentFocus();
    }

    updateActiveRegion() {
        if (!this.activeRegion) {
            return;
        }
        this.activeRegion.classList.add(A11yClassNames.ACTIVE);

        // ensure active region element is focusable
        if (!this.activeRegion.getAttribute('tabindex')) {
            this.activeRegion.setAttribute('tabindex', -1);
        }
    }

    updateActiveSection() {
        if (!this.activeSection) {
            return;
        }
        this.activeSection.classList.add(A11yClassNames.ACTIVE);

        // ensure active section element is focusable
        if (!this.activeSection.getAttribute('tabindex')) {
            this.activeSection.setAttribute('tabindex', -1);
        }
    }

    updateActiveElement() {
        if (!this.activeElement) {
            return;
        }
        this.activeElement.classList.add(A11yClassNames.ACTIVE);
    }

    udpateCurrentFocus(forceUpdate = false) {
        if ((!this.focusedElement || !this.a11yKeyEngaged) && !forceUpdate) {
            return;
        }
        this.focusedElement.classList.add(A11yClassNames.FOCUSED);
    }

    clearActiveRegion() {
        if (this.activeRegion) {
            this.activeRegion.classList.remove(A11yClassNames.ACTIVE);
            this.activeRegion.dispatchEvent(new Event(A11yCustomEventTypes.DEACTIVATE));
            this.activeRegion.removeEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveRegionUpdate);
            this.activeRegion = null;
        }
        this.clearActiveSection();
    }

    clearActiveSection() {
        if (this.activeSection) {
            this.activeSection.classList.remove(A11yClassNames.ACTIVE);
            this.activeSection.dispatchEvent(new Event(A11yCustomEventTypes.DEACTIVATE));
            this.activeSection.removeEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveSectionUpdate);
            this.activeSection = null;
        }
        this.clearActiveElement();
    }

    clearActiveElement() {
        if (this.activeElement) {
            if (this.activeElement !== this.activeRegion && this.activeElement !== this.activeSection) {
                this.activeElement.classList.remove(A11yClassNames.ACTIVE);
                this.activeElement.dispatchEvent(new Event(A11yCustomEventTypes.DEACTIVATE));
            }
            this.activeElement.removeEventListener(A11yCustomEventTypes.UPDATE, this.handleActiveElementUpdate);
            this.activeElement = null;
        }
    }

    clearCurrentFocus(blurActiveElement = false) {
        Array.from(document.getElementsByClassName(A11yClassNames.FOCUSED)).forEach((element) => {
            element.classList.remove(A11yClassNames.FOCUSED);
        });
        if (blurActiveElement) {
            document.activeElement.blur();
        }
    }

    // helper methods

    getAllRegions() {
        return document.getElementsByClassName(A11yClassNames.REGION);
    }

    getAllSectionsForRegion(region) {
        if (!region) {
            return null;
        }
        return region.getElementsByClassName(A11yClassNames.SECTION);
    }

    sortElementsByAttributeOrder(elements) {
        if (!elements || !elements.length) {
            return [];
        }
        return Array.from(elements).sort((elementA, elementB) => {
            const elementAOrder = elementA.getAttribute(A11yAttributeNames.SORT_ORDER);
            const elementBOrder = elementB.getAttribute(A11yAttributeNames.SORT_ORDER);
            return elementAOrder - elementBOrder;
        });
    }

    elementIsVisible(element) {
        return element && element.offsetParent;
    }

    getAllModals() {
        return document.getElementsByClassName(A11yClassNames.MODAL);
    }

    getAllPopups() {
        return document.getElementsByClassName(A11yClassNames.POPUP);
    }

    getLoopNavigationAttribute(element) {
        const attributeValue = element.getAttribute(A11yAttributeNames.LOOP_NAVIGATION);
        if (attributeValue && attributeValue.toLowerCase() === 'false') {
            return false;
        }
        return true;
    }

    getOrderReverseAttribute(element) {
        const attributeValue = element.getAttribute(A11yAttributeNames.ORDER_REVERSE);
        if (attributeValue && attributeValue.toLowerCase() === 'true') {
            return true;
        }
        return false;
    }

    getFocusChildAttribute(element) {
        const attributeValue = element.getAttribute(A11yAttributeNames.FOCUS_CHILD);
        if (attributeValue && attributeValue.toLowerCase() === 'true') {
            return true;
        }
        return false;
    }

    // event handling methods

    handleKeyDown = (event) => {
        const modifierKeys = {
            ctrlIsPressed: event.ctrlKey || (!event.ctrlKey && event.metaKey),
            altIsPressed: event.altKey,
            shiftIsPressed: event.shiftKey,
        };
        switch (true) {
        case isKeyPressed(event, Constants.KeyCodes.TAB):
            if ((!isMac() && modifierKeys.altIsPressed) || cmdOrCtrlPressed(event)) {
                return;
            }
            this.a11yKeyEngaged = true;
            break;
        case isKeyPressed(event, Constants.KeyCodes.TILDE):
            if (!this.regions || !this.regions.length) {
                return;
            }
            if (modifierKeys.ctrlIsPressed) {
                this.a11yKeyEngaged = true;
                event.preventDefault();
                if (modifierKeys.shiftIsPressed) {
                    this.previousRegion();
                } else {
                    this.nextRegion();
                }
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.F6):
            if (!isDesktopApp() && !cmdOrCtrlPressed(event)) {
                return;
            }
            this.a11yKeyEngaged = true;
            if (modifierKeys.shiftIsPressed) {
                this.previousRegion();
            } else {
                this.nextRegion();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.UP):
            if (!this.navInProgress || !this.sections || !this.sections.length) {
                return;
            }
            this.a11yKeyEngaged = true;
            event.preventDefault();
            if (this.reverseSections) {
                this.nextSection();
            } else {
                this.previousSection();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.DOWN):
            if (!this.navInProgress || !this.sections || !this.sections.length) {
                return;
            }
            this.a11yKeyEngaged = true;
            event.preventDefault();
            if (this.reverseSections) {
                this.previousSection();
            } else {
                this.nextSection();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.ESCAPE):
            this.cancelNavigation();
            break;
        }
    }

    handleKeyUp = () => {
        this.a11yKeyEngaged = false;
    }

    handleMouseClick = (event) => {
        if (!this.navInProgress || event.target === this.activeElement) {
            return;
        }
        this.cancelNavigation();
    }

    handleFocus = (event) => {
        this.nextElement(event.target, event.path);
    }

    handleActiveRegionUpdate = () => {
        this.updateActiveRegion();
        this.udpateCurrentFocus(true);
    }

    handleActiveSectionUpdate = () => {
        this.updateActiveSection();
        this.udpateCurrentFocus(true);
    }

    handleActiveElementUpdate = () => {
        this.updateActiveElement();
        this.udpateCurrentFocus(true);
    }
}
