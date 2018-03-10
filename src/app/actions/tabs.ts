import Store from "../store";

import { tabTransitions } from "../defaults/tabs";

import {
  SYSTEM_BAR_HEIGHT,
  TAB_MAX_WIDTH,
  TAB_MIN_WIDTH,
  TAB_PINNED_WIDTH
} from "../constants/design";

import { ITab, ITabGroup } from "../interfaces";

import { addPage } from "./pages";

let nextTabId = 0;

export const setTabAnimation = (
  tab: ITab,
  property: "left" | "width",
  flag: boolean
) => {
  if (flag) {
    if (
      !(tab.transitions.filter(item => item.property === property).length > 0)
    ) {
      tab.transitions.push({
        property,
        ...tabTransitions.left
      });
    }
  } else {
    tab.transitions = tab.transitions.filter(
      item => item.property !== property
    );
  }
};

export const setTabsPositions = (
  animation = true,
  addTabButtonAnimation = true
) => {
  const { tabs } = Store.tabGroups[0];
  const containerWidth = Store.getTabBarWidth();

  let left = 0;

  Store.addTabButton.leftAnimation = addTabButtonAnimation;

  requestAnimationFrame(() => {
    for (const item of tabs) {
      setTabAnimation(item, "left", animation);

      item.left = left;
      left += item.width;
    }
    if (left >= containerWidth - SYSTEM_BAR_HEIGHT) {
      Store.addTabButton.left = containerWidth - SYSTEM_BAR_HEIGHT;
    } else {
      Store.addTabButton.left = left;
    }
  });
};

export const getTabLeft = (tab: ITab): number => {
  const { tabs } = Store.tabGroups[0];
  const previousTab = tabs[tabs.indexOf(tab) - 1];

  if (previousTab) {
    const { left, width } = previousTab;
    return left + width;
  }

  return 0;
};

export const setTabsWidths = (animation = true) => {
  const { tabs } = Store.tabGroups[0];
  const containerWidth = Store.getTabBarWidth();

  requestAnimationFrame(() => {
    for (const item of tabs) {
      setTabAnimation(item, "width", animation);

      const width = getTabWidth(item);
      item.width = width;
    }
  });
};

export const getTabWidth = (tab: ITab): number => {
  const { tabs } = Store.tabGroups[0];
  const containerWidth = Store.getTabBarWidth();

  let width = tab.pinned
    ? TAB_PINNED_WIDTH
    : (containerWidth - SYSTEM_BAR_HEIGHT) / tabs.length;

  if (width > TAB_MAX_WIDTH) {
    width = TAB_MAX_WIDTH;
  }

  if (!tab.pinned && width < TAB_MIN_WIDTH) {
    width = TAB_MIN_WIDTH;
  }

  return width;
};

export const getTabById = (id: number): ITab => {
  const { tabGroups } = Store;

  const tabs = tabGroups.map((tabGroup: ITabGroup) => {
    const tab = tabGroup.tabs.filter((item: ITab) => item.id === id)[0];

    if (tab != null) {
      return tab;
    }
  });

  return tabs[0];
};

export const addTab = (): ITab => {
  const index =
    Store.tabGroups[0].tabs.push({
      id: nextTabId,
      title: "New tab",
      left: 0,
      width: 0,
      pinned: false,
      transitions: [
        {
          property: "background-color",
          ...tabTransitions["background-color"]
        }
      ]
    }) - 1;

  const tab = Store.tabGroups[0].tabs[index];

  selectTab(tab);
  addPage(tab.id);

  nextTabId += 1;

  return tab;
};

export const removeTab = (tab: ITab) => {
  Store.tabGroups[0].tabs = Store.tabGroups[0].tabs.filter(
    ({ id }) => tab.id !== id
  );
  Store.pages = Store.pages.filter(({ id }) => tab.id !== id);
};

export const selectTab = (tab: ITab) => {
  Store.tabGroups[0].selectedTab = tab.id;
};
