/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

const whitelistedHostnames = new Set()

// Listen for messages from the page
window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
  const type = event.data.type
  

    if (type === "UPDATE_SKIP_CONFIRMATION_CONFIG") {
      const { skip } = event.data
      skipConfirmation = skip
    }

  if (type === "FETCH_WEB_PAGE") {
    const { url, id } = event.data
    
    if (!isShowingReader) {
      return
    }
    let hostname
    try{
      hostname = new URL(url).hostname

    }catch(e){
      return
    }
    

      if (!whitelistedHostnames.has(hostname) && !skipConfirmation) {
        const confirmed = confirm(`Allow fetching a page from another website?\n${url}`);
        if (confirmed) {
          whitelistedHostnames.add(hostname)
        } else {
          window.postMessage({ type: "FETCH_RESULT", id, url, isError:true, html: 'Request not allowed by the user' },"*");
          return
        }
      }
          // Forward request to background
          chrome.runtime.sendMessage({ action: "fetchWebPage", url, id });
    }
    if (type === "RELOAD_PAGE") {
        chrome.storage.local.set({ justReloaded: true });
        location.reload()
    }

    if (type === "SAVE_OBJECT_IN_LOCAL_STORAGE") {
        const { objectName, object } = event.data
        chrome.storage.local.set({ [objectName]: object });
    }

    if (type === "GET_OBJECT_FROM_LOCAL_STORAGE") {
        const { objectName, id } = event.data
        const result = await chrome.storage.local.get(objectName)
        const savedObject = result[objectName]
        window.postMessage({type: "LOCAL_STORAGE_RESULT", value:savedObject, id})
    }

    

});

// Listen for results from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "fetchResult") {
    window.postMessage(
      { type: "FETCH_RESULT", id: message.id, url:message.url, isError:message.isError, html: message.html },
      "*"
    );
  }
});