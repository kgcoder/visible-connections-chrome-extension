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
    const {areLinksThick,skipConfirmation} = response

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

    


    const myLink = document.getElementById("my-link")
    
    const siteLink = document.getElementById("site-link")

    const examplesLink = document.getElementById("visible-connections-examples-link")
    myLink.addEventListener('click',() => window.open('https://x.com/karengrig_dev','_blank'))
    siteLink.addEventListener('click',() => window.open('https://reinventingtheweb.com','_blank'))
    examplesLink.addEventListener('click',() => window.open('https://reinventingtheweb.com/2025/06/15/examples-of-documents-with-visible-connections/','_blank'))




    const popupFooter = document.getElementById("popup-footer")
    popupFooter.style.display = 'flex'



}



function sendMessageToPage(message) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message)
    })
}

