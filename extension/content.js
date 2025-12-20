/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

let parsingConfig = ''
let currentLocation
let hasFlinks = false


let hasEmbeddedHDOC = false

let skipConfirmation = false


let isShowingReader = false
    
    
document.addEventListener('DOMContentLoaded', onLoad);


//chrome.storage.local.clear()

async function onLoad() {
    
    currentLocation = window.location.toString()

    if (currentLocation.includes('#')) {
        currentLocation = currentLocation.split('#')[0]
    }


    let contentEl = document.querySelector('.hdoc-content')

    if (contentEl) {

        const dataScript = document.getElementById("hdoc-data");

        if (dataScript) {
            try {
                const rawJSON = dataScript.textContent.trim().replace(/^<!\[CDATA\[/,'').replace(/\]\]$/,'')

                const hdocDataJSON = JSON.parse(rawJSON)  

                const header = hdocDataJSON.header
                if (header) {
                    const title = header.h1
                    if (title && title.trim()) {
                        hasEmbeddedHDOC = true
                    }
                }

                
                const connections = hdocDataJSON.connections
                if (connections && connections.length) {
                    for (const con of connections) {
                        if (con.flinks && con.flinks.length) {
                            hasFlinks = true
                            break
                        }
                    }
                }

            
                



            } catch (e) {
                console.error('JSON parse error',e)
            }
        }  
    }




    const result = await chrome.storage.local.get('justReloaded')
    const justReloaded = !!result.justReloaded

    if (justReloaded) {
        chrome.storage.local.set({ justReloaded: false });
    } else {
        showReaderOverlay()
        
    }

}



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if(message === 'giveMePageMetadata'){
        
        sendPageMetadata(sendResponse)

    }else{
        const messageName = message.messageName

        if(messageName === 'DownloadConnectedPage'){
            const url = message.url
            window.postMessage({ type: "DOWNLOAD_USER_SPECIFIED_PAGE", url },"*");
        }

        if (messageName === 'ToggleThickLinks') {
            const useThickLinks = message.enabled
            saveFlinksThickness(useThickLinks)
            window.postMessage({ type: "FLINK_THICKNESS_UPDATED", useThickLinks },"*");
        }

        if (messageName === 'SetFetchConfirmationPreference') {
            const skipConfirmation = message.skipConfirmation
            saveSkipConfirmation(skipConfirmation)
            window.postMessage({ type: "UPDATE_SKIP_CONFIRMATION_CONFIG", skip:skipConfirmation },"*");   
        }
        

    }
    

    return true

})



async function sendPageMetadata(sendResponse) {

    const areLinksThick = await getLinkThicknessFromStorage()

    const skipConfirmation = await getSkipConfirmationFromStorage()


    sendResponse({
        areLinksThick,
        skipConfirmation,
        isShowingReader
    })
}






async function getLinkThicknessFromStorage() {
    const result = await chrome.storage.local.get('thickLinks')
    const isThick = result.thickLinks ?? false
    return isThick
}

async function saveFlinksThickness(isThick) {
    chrome.storage.local.set({ thickLinks:isThick })
}


async function getSkipConfirmationFromStorage() {
    const result = await chrome.storage.local.get('skipConfirmation')
    const skip = result.skipConfirmation ?? false
    return skip
}

async function saveSkipConfirmation(skipConfirmation) {
    chrome.storage.local.set({ skipConfirmation })
}





async function showReaderOverlay() {

    const useThickLinks = await getLinkThicknessFromStorage()
    skipConfirmation = await getSkipConfirmationFromStorage()



    let theTitle
    let contentEl = document.querySelector('.hdoc-content')

    let hdocDataJSON
  
    if (contentEl) {

        const dataScript = document.getElementById("hdoc-data");

        if (dataScript) {
            try {
                const rawJSON = dataScript.textContent.trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]$/, '')

                hdocDataJSON = JSON.parse(rawJSON)

                const header = hdocDataJSON.header
                if (header) {
                    const title = header.h1
                    if (title && title.trim()) {
                        theTitle = title
                    }
                }

            } catch (e) {
                console.log(e)
            }
        }
    }

    let contentString
    if (!theTitle || !contentEl) {

        contentString = document.body.innerHTML
        const pre = document.querySelector('pre')
        if (pre) {
            contentString = unescapeHTML(pre.innerHTML)
        }
   
        const collageMatch = contentString.match(/<cdoc\b[^>]*>([\s\S]*?)<\/cdoc>/im)
        const textViewMatch = contentString.match(/<hdoc\b[^>]*>([\s\S]*?)<\/hdoc>/im)
        const condocMatch = contentString.match(/<condoc\b[^>]*>([\s\S]*?)<\/condoc>/im)



        if (!textViewMatch && !collageMatch && !condocMatch) return
        


    } else if (contentEl) {
        const flinksButton = contentEl.querySelector('.HasFlinksButton,.HasFlinksEl')
        if (flinksButton) flinksButton.remove()
        
    }
        
    if(!contentString)contentString = document.documentElement.outerHTML


    const res = await fetch(chrome.runtime.getURL("reader/reader.html"));
    const html = await res.text();
    


    document.documentElement.innerHTML = `
  <head><title>${document.title}</title></head>
  <body><div id="my-reader">Loading...</div></body>
`;
    for (const script of document.scripts) {
  script.remove();
}
document.write = () => {};
    
    


    document.body.innerHTML = html;

    document.body.removeAttribute("class");

    isShowingReader = true

    const script = document.createElement('script');
    script.type = "module";
    script.src = chrome.runtime.getURL('reader/readerStartUp.js');
    script.onload = () => {
        window.dispatchEvent(new CustomEvent('initReader', {detail:{ contentString, url:currentLocation, useThickLinks }}));
    };
    document.body.appendChild(script);




    const cssLink = document.createElement('link')
    cssLink.href = chrome.runtime.getURL('reader/reader.css')
    cssLink.rel = "stylesheet"
    document.head.appendChild(cssLink)

    const pageInfoCSSLink = document.createElement('link')
    pageInfoCSSLink.href = chrome.runtime.getURL('reader/PageInfo.css')
    pageInfoCSSLink.rel = "stylesheet"
    document.head.appendChild(pageInfoCSSLink)

    const exportPageCSSLink = document.createElement('link')
    exportPageCSSLink.href = chrome.runtime.getURL('reader/exportPage.css')
    exportPageCSSLink.rel = "stylesheet"
    document.head.appendChild(exportPageCSSLink)

    const lightThemeLink = document.createElement('link')
    lightThemeLink.href = chrome.runtime.getURL('reader/themes/light.css')
    lightThemeLink.rel = "stylesheet"
    document.head.appendChild(lightThemeLink)

    const darkThemeLink = document.createElement('link')
    darkThemeLink.href = chrome.runtime.getURL('reader/themes/dark.css')
    darkThemeLink.rel = "stylesheet"
    document.head.appendChild(darkThemeLink)

    const sepiaThemeLink = document.createElement('link')
    sepiaThemeLink.href = chrome.runtime.getURL('reader/themes/sepia.css')
    sepiaThemeLink.rel = "stylesheet"
    document.head.appendChild(sepiaThemeLink)
}


function unescapeHTML(html) {
    return new DOMParser()
        .parseFromString('<!doctype html><body>' + html, 'text/html')
        .body.textContent;
}