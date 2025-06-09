const handleOnPageClick = (info: any, tab: any) => {
  console.log("Context Info: ", info);
  console.log("Context Tab: ", tab);
};

const handleOnSelectionClick = (info: any, tab: any) => {
  console.log("Context Info: ", info);
  console.log("Context Tab: ", tab);
};

export default chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Service Worker working...");

  /* Create a menu item in the context menu */
  chrome.contextMenus.create({
    id: "some-id-page",
    title: "New Menu Option - Page",
    contexts: ["page"],
  });

  /* Create a menu item in the selected item context menu */
  chrome.contextMenus.create({
    id: "some-id-selection",
    title: "New Menu Option - Selection",
    contexts: ["selection"],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId } = info;
    if (menuItemId === "some-id-page") handleOnPageClick(info, tab);
    if (menuItemId === "some-id-selection") handleOnSelectionClick(info, tab);
  });
});

/*
To attach a hotkey command to the popup, use an _execute_action object in manifest.json
However, to attach a hotkey command to side panel, you must have an event listner.
*/

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_side_panel") {
    chrome.windows.getCurrent((w) => {
      chrome.sidePanel.open({ windowId: w.id! });
      console.log("Command/Ctrl + O triggered! :)");
    });
  }
});
