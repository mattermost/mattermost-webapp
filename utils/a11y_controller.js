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
        this.sectionHTMLCollection = null; // populated when region changes
        this.modalHTMLCollection = this.getAllModals();
        this.popupHTMLCollection = this.getAllPopups();

        this.activeRegion = null;
        this.activeSection = null;
        this.activeElement = null;

        this.mouseIsPressed = false;

        this.lastInputEventIsKeyboard = false;

        this.enterKeyIsPressed = false;
        this.f6KeyIsPressed = false;
        this.upArrowKeyIsPressed = false;
        this.downArrowKeyIsPressed = false;
        this.tabKeyIsPressed = false;
        this.tildeKeyIsPressed = false;

        // used to reset navigation whenever navigation within a region occurs (section or element)
        this.resetNavigation = false;

        document.addEventListener(EventTypes.KEY_DOWN, this.handleKeyDown, listenerOptions);
        document.addEventListener(EventTypes.KEY_UP, this.handleKeyUp, listenerOptions);
        document.addEventListener(EventTypes.CLICK, this.handleMouseClick, listenerOptions);
        document.addEventListener(EventTypes.MOUSE_DOWN, this.handleMouseDown, listenerOptions);
        document.addEventListener(EventTypes.MOUSE_UP, this.handleMouseUp, listenerOptions);
        document.addEventListener(EventTypes.FOCUS, this.handleFocus, listenerOptions);
    }

    destroy() {
        this.clearActiveRegion();
        this.clearCurrentFocus();

        document.removeEventListener(EventTypes.KEY_DOWN, this.handleKeyDown, listenerOptions);
        document.removeEventListener(EventTypes.KEY_UP, this.handleKeyUp, listenerOptions);
        document.removeEventListener(EventTypes.CLICK, this.handleMouseClick, listenerOptions);
        document.removeEventListener(EventTypes.MOUSE_DOWN, this.handleMouseDown, listenerOptions);
        document.removeEventListener(EventTypes.MOUSE_UP, this.handleMouseUp, listenerOptions);
        document.removeEventListener(EventTypes.FOCUS, this.handleFocus, listenerOptions);
    }

    // convenience getter/setters

    /**
     * Determines if keyboard navigation is currently in progress based on several criteria as follows:
     * 1. There must be defined regions and a single region must be active
     * 2. The last input event detected must be a keyboard event
     * 3. There must be no open modals and/or popups
     * 4. There must be an active element and it must support classList
     */
    get navigationInProgress() {
        if (!this.regions || !this.regions.length || !this.isElementValid(this.activeRegion)) {
            return false;
        }
        if (!this.lastInputEventIsKeyboard) {
            return false;
        }
        if (this.modalIsOpen || this.popupIsOpen) {
            return false;
        }
        if (!this.isElementValid(this.activeElement)) {
            return false;
        }
        return true;
    }

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
        if (this.shouldReverseSections) {
            domElements.reverse();
        }
        return domElements;
    }

    /**
     * Returns the index of the active region
     */
    get activeRegionIndex() {
        if (!this.activeRegion) {
            return null;
        }
        return this.regions.indexOf(this.activeRegion);
    }

    /**
     * Returns the index of the active section
     */
    get activeSectionIndex() {
        if (!this.activeSection) {
            return null;
        }
        return this.sections.indexOf(this.activeSection);
    }

    /**
     * Returns whether the regions requires reverse section navigation
     */
    get shouldReverseSections() {
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

    get a11yKeyIsPressed() {
        return this.f6KeyIsPressed ||
               this.upArrowKeyIsPressed ||
               this.downArrowKeyIsPressed ||
               this.tabKeyIsPressed ||
               this.tildeKeyIsPressed;
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

    nextElement(element, elementPath = false) {
        let region;
        let section;
        if (elementPath && elementPath.length) {
            // is the current element in an active region?
            if (elementPath.indexOf(this.activeRegion) < 0) {
                region = elementPath.find((pathElement) => {
                    if (!pathElement.classList) {
                        return false;
                    }
                    return pathElement.classList.contains(A11yClassNames.REGION);
                });
            }

            // is the current element in an active section?
            if (elementPath.indexOf(this.activeSection) < 0) {
                section = elementPath.find((pathElement) => {
                    if (!pathElement.classList) {
                        return false;
                    }
                    return pathElement.classList.contains(A11yClassNames.SECTION);
                });
            }
        } else if (elementPath && typeof element.closest === 'function') {
            region = element.closest(`.${A11yClassNames.REGION}`);
            section = element.closest(`.${A11yClassNames.SECTION}`);
        }
        if (region && this.activeRegion !== region) {
            this.setActiveRegion(region, false);
        }
        if (section && this.activeSection !== section) {
            this.setActiveSection(section);
        }
        this.setActiveElement(element);
        this.setCurrentFocus();
        this.resetNavigation = true;
    }

    cancelNavigation() {
        this.clearActiveRegion();
        this.setCurrentFocus();
        this.resetInterractionStates();
    }

    // private methods

    setActiveRegion(element, focusChildIfNeeded = true) {
        if (!this.isElementValid(element, [this.activeRegion]) && !this.resetNavigation) {
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
        if (!this.isElementValid(element, [this.activeSection])) {
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
        if (!this.isElementValid(element, [this.activeElement])) {
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
        if ((!this.focusedElement || !this.a11yKeyIsPressed) && !forceUpdate) {
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

    resetInterractionStates() {
        this.mouseIsPressed = false;
        this.f6KeyIsPressed = false;
        this.upArrowKeyIsPressed = false;
        this.downArrowKeyIsPressed = false;
        this.tabKeyIsPressed = false;
        this.tildeKeyIsPressed = false;
        this.enterKeyIsPressed = false;
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

    isElementValid(element, invalidElements = []) {
        if (
            element &&
            element.classList &&
            !invalidElements.includes(element)
        ) {
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
        this.lastInputEventIsKeyboard = true;
        switch (true) {
        case isKeyPressed(event, Constants.KeyCodes.TAB):
            if ((!isMac() && modifierKeys.altIsPressed) || cmdOrCtrlPressed(event)) {
                return;
            }
            this.tabKeyIsPressed = true;
            break;
        case isKeyPressed(event, Constants.KeyCodes.TILDE):
            if (!this.regions || !this.regions.length) {
                return;
            }
            if (modifierKeys.ctrlIsPressed) {
                this.tildeKeyIsPressed = true;
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
            this.f6KeyIsPressed = true;
            event.preventDefault();
            if (modifierKeys.shiftIsPressed) {
                this.previousRegion();
            } else {
                this.nextRegion();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.UP):
            if (!this.navigationInProgress || !this.sections || !this.sections.length) {
                return;
            }
            this.upArrowKeyIsPressed = true;
            event.preventDefault();
            if (this.shouldReverseSections) {
                this.nextSection();
            } else {
                this.previousSection();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.DOWN):
            if (!this.navigationInProgress || !this.sections || !this.sections.length) {
                return;
            }
            this.downArrowKeyIsPressed = true;
            event.preventDefault();
            if (this.shouldReverseSections) {
                this.previousSection();
            } else {
                this.nextSection();
            }
            break;
        case isKeyPressed(event, Constants.KeyCodes.ESCAPE):
            if (!this.navigationInProgress) {
                return;
            }
            event.preventDefault();
            this.cancelNavigation();
            break;
        case isKeyPressed(event, Constants.KeyCodes.ENTER):
            this.enterKeyIsPressed = true;
            break;
        }
    }

    handleKeyUp = () => {
        this.resetInterractionStates();
    }

    handleMouseClick = (event) => {
        // hitting enter on a <button> triggers a click event
        if (!this.enterKeyIsPressed) {
            this.lastInputEventIsKeyboard = false;
        }
        if (event.target === this.activeElement) {
            return;
        }
        this.cancelNavigation();
    }

    handleMouseDown = () => {
        this.mouseIsPressed = true;
    }

    handleMouseUp = () => {
        this.mouseIsPressed = false;
    }

    handleFocus = (event) => {
        if (!this.mouseIsPressed) {
            this.nextElement(event.target, event.path || true);
        }
    }

    handleActiveRegionUpdate = () => {
        if (this.navigationInProgress) {
            this.updateActiveRegion();
            if (this.focusedElement === this.activeRegion) {
                this.udpateCurrentFocus(true);
            }
        }
    }

    handleActiveSectionUpdate = () => {
        if (this.navigationInProgress) {
            this.updateActiveSection();
            if (this.focusedElement === this.activeSection) {
                this.udpateCurrentFocus(true);
            }
        }
    }

    handleActiveElementUpdate = () => {
        if (this.navigationInProgress) {
            this.updateActiveElement();
            if (this.focusedElement === this.activeElement) {
                this.udpateCurrentFocus(true);
            }
        }
    }
}
