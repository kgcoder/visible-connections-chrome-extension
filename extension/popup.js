/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/


document.addEventListener('DOMContentLoaded', function () {

    getPageMetadata()

}, false)


function getPageMetadata() {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

        chrome.tabs.sendMessage(tabs[0].id, 'giveMePageMetadata', function (response, error) {
         
            updatePageMetadata(response)

        })
    })
}




function updatePageMetadata(response) {
    const {areLinksThick,skipConfirmation,isShowingReader} = response

    const mainMenu = document.getElementById("mainMenu")

    const thickLinksLabel = document.createElement('label')
    thickLinksLabel.style.display = 'flex'
    thickLinksLabel.style.alignItems = 'center'
    thickLinksLabel.style.gap = '8px'
    thickLinksLabel.style.marginBottom = '8px'

    const thickLinksCheckbox = document.createElement('input')
    thickLinksCheckbox.type = 'checkbox'
    thickLinksCheckbox.id = 'thick-links-checkbox'
    thickLinksCheckbox.checked = areLinksThick

    thickLinksLabel.appendChild(thickLinksCheckbox)
    thickLinksLabel.appendChild(document.createTextNode('Thick links'))

    mainMenu.appendChild(thickLinksLabel)

    thickLinksCheckbox.addEventListener('change', () => {
        sendMessageToPage({ messageName: 'ToggleThickLinks', enabled: thickLinksCheckbox.checked })
    })


     const dontAskWhenFetchingLabel = document.createElement('label')
    dontAskWhenFetchingLabel.style.display = 'flex'
    dontAskWhenFetchingLabel.style.alignItems = 'center'
    dontAskWhenFetchingLabel.style.gap = '8px'
    dontAskWhenFetchingLabel.style.marginBottom = '8px'

    const dontAskWhenFetchingCheckbox = document.createElement('input')
    dontAskWhenFetchingCheckbox.type = 'checkbox'
    dontAskWhenFetchingCheckbox.id = 'dont-ask-checkbox'
    dontAskWhenFetchingCheckbox.checked = skipConfirmation

    dontAskWhenFetchingLabel.appendChild(dontAskWhenFetchingCheckbox)
    dontAskWhenFetchingLabel.appendChild(document.createTextNode('Don\'t ask for confirmation when fetching pages from other websites'))

    mainMenu.appendChild(dontAskWhenFetchingLabel)

    dontAskWhenFetchingCheckbox.addEventListener('change', () => {
        sendMessageToPage({ messageName: 'SetFetchConfirmationPreference', skipConfirmation: dontAskWhenFetchingCheckbox.checked })
    })


    if(isShowingReader){
        const rightPageUrlContainer = document.getElementById("right-page-url-container")
        rightPageUrlContainer.style.display = 'flex'

        const button = document.getElementById("right-doc-download-button")


        button.addEventListener('click', () => {
            const input = document.getElementById("right-doc-url-input")
            sendMessageToPage({ messageName: 'DownloadConnectedPage', url: input.value.trim() })
        })

    }


    


    const howToLink = document.getElementById("how-to-link")
    const examplesLink = document.getElementById("visible-connections-examples-link")
    const sourceCodeLink = document.getElementById("source-code-link")

   examplesLink.addEventListener('click',() => window.open('https://reinventingtheweb.com/community-resources/','_blank'))
    howToLink.addEventListener('click',() => window.open('https://reinventingtheweb.com/how-to-create-visible-connections/','_blank'))
    sourceCodeLink.addEventListener('click',() => window.open('https://github.com/kgcoder/visible-connections-chrome-extension','_blank'))




    mainMenu.style.display = 'flex'


}



function sendMessageToPage(message) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message)
    })
}

