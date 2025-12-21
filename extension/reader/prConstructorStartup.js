/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

import g from "./Globals.js"
import { copyDataToClipboard, getProtocolAndDomainFromUrl, removeTitleFromContent, replaceMediaTagsWithLinksInDiv, sanitizeHtml, setTheme, showToastMessage } from "./helpers.js";
import IconsInfo from "./Icons.js";
import { parseStaticContent } from "./parsers/ParsingManager.js";
import { checkKey } from "./KeyboardManager.js";
import { getObjectFromLocalStorage } from "./LocalStorageManager.js";
import { getActionsFromConfigString, parseHtmlStringWithConfig } from "./parsers/HtmlPageParser.js";
import { populateHeaderDiv } from "./HeaderMethods.js";

let originalContentString
let originalUrl

let currentTitle
let currentContent
let finalUrl

let possibleContentSelectors = []
let possibleTitleSelectors = []

let currentPossibleContentSelectorIndex = 0
let currentPossibleTitleSelectorIndex = 0



// List of selectors to try in order
const selectors = [
    

    //Wikipedia
    '.mw-body-content',

    // WordPress
    '.entry-content',
    '.post-content',
    '.post-body',
    '.content-area',
    '.hentry',
    '.content',
    '.main-content',
    '.supercontentwrapper',

        // Semantic
    'main',
    'article',
    '[role="main"]',

    // Joomla
    '.item-page',
    '.contentpane',
    '.blog-featured',
    '.com-content-article__body',

    // Drupal
    '.node__content',
    '.field--name-body',
    '.article-content',

    // Ghost
    '.gh-content',
    '.post-content',

    // Medium
    '.section-content',
    '.pw-post-body',
    '.meteredContent',
    
    

    // General fallbacks
    '.content',
    '.main-content',
    '.page-content',
    '.post',
    '.story-content',
    '.article-body',
    '.text',
    '.entry',
    '.read__content',
    '.content-wrapper',
    

    'body'

    
];




window.addEventListener('initParsingRulesConstructor', async (e) => {
    const { url, contentString, } = e.detail;

    originalUrl = url
    originalContentString = contentString


    loadUIAndIcons()

    const copyUrlButton = document.getElementById("copy-url-button")
    copyUrlButton.addEventListener('click',(e) => {
        e.preventDefault()
        copyDataToClipboard(finalUrl)
        showToastMessage('URL was copied to clipboard')  
    })


    const result = guessParsingRules()

    if(result && result.isText){

        finalUrl = originalUrl + '#pr=text'

        const pageDiv = document.getElementById("pageDiv")

        pageDiv.innerHTML = contentString


        const fullUrlSpan = document.getElementById("full-url-span")
        fullUrlSpan.innerText = finalUrl




    }else if(result){

        const {contentSelectors,titleSelectors, additionalForbiddenTags} = result 

        possibleContentSelectors = contentSelectors
        possibleTitleSelectors = titleSelectors

        const contentSelectorInput = document.getElementById("contentSelector")
        const titleSelectorInput = document.getElementById("titleSelector")
        const removeSelectorsTextarea = document.getElementById("removeSelectors")

        const contenSelectorLabel = document.getElementById("content-selector-label")
        contenSelectorLabel.innerText = `Content selector (1/${possibleContentSelectors.length})`
        if(contentSelectors.length){
            contentSelectorInput.value = contentSelectors[0]

        }

        const titleSelectorLabel = document.getElementById("title-selector-label")
        titleSelectorLabel.innerText = `Title selector (1/${possibleTitleSelectors.length})`
        if(titleSelectors){
            titleSelectorInput.value = titleSelectors[0]

        }
        removeSelectorsTextarea.value = additionalForbiddenTags.join('\n')

        constructFullUrl()

        renderPage()

    }



    const contentSelectorNextGuessButton = document.getElementById("content-next-guess-button")

    contentSelectorNextGuessButton.addEventListener('click',(e) => {
        e.preventDefault()

        currentPossibleContentSelectorIndex++
        if(currentPossibleContentSelectorIndex >= possibleContentSelectors.length){
            currentPossibleContentSelectorIndex = 0
        }

        const contentSelectorLabel = document.getElementById("content-selector-label")
        contentSelectorLabel.innerText = `Content selector (${currentPossibleContentSelectorIndex + 1}/${possibleContentSelectors.length})`


        const contentSelectorInput = document.getElementById("contentSelector")
        contentSelectorInput.value = possibleContentSelectors[currentPossibleContentSelectorIndex]


        constructFullUrl()

        renderPage()


        
    })


    const titleSelectorNextGuessButton = document.getElementById("title-next-guess-button")

    titleSelectorNextGuessButton.addEventListener('click',(e) => {
        e.preventDefault()

        currentPossibleTitleSelectorIndex++
        if(currentPossibleTitleSelectorIndex >= possibleTitleSelectors.length){
            currentPossibleTitleSelectorIndex = 0
        }

        const titleSelectorLabel = document.getElementById("title-selector-label")
        titleSelectorLabel.innerText = `Title selector (${currentPossibleTitleSelectorIndex + 1}/${possibleTitleSelectors.length})`


        const titleSelectorInput = document.getElementById("titleSelector")
        titleSelectorInput.value = possibleTitleSelectors[currentPossibleTitleSelectorIndex]

        constructFullUrl()
        renderPage()
    })


    const updateButton = document.getElementById("update-button")

    updateButton.addEventListener('click',(e) => {
        e.preventDefault()

        constructFullUrl()
        renderPage()
    })

 

});


function loadUIAndIcons() {
  
    g.iconsInfo = new IconsInfo()

    g.iconsInfo.loadAllIcons()




}


function constructFullUrl(){
    const contentSelectorInput = document.getElementById("contentSelector")
    const titleSelectorInput = document.getElementById("titleSelector")
    const removeSelectorsTextarea = document.getElementById("removeSelectors")
    const authorSelectorInput = document.getElementById("authorSelector")
    const dateSelectorInput = document.getElementById("dateSelector")


    const contentSelector = contentSelectorInput.value
    const titleSelector = titleSelectorInput.value
    const authorSelector = authorSelectorInput.value
    const dateSelector = dateSelectorInput.value

    const removalSelectors = removeSelectorsTextarea.value.split('\n').filter(sel => !!sel.trim())


    let titleURLPart = ''
    if (titleSelector !== 'h1' && titleSelector.trim().length) {
        titleURLPart = `/t/${encodeURIComponent(titleSelector.trim())}`
    }


    let authorUrlPart = ''
    if(authorSelector.trim()){
        authorUrlPart = `/a/${encodeURIComponent(authorSelector.trim())}`
    }
   
    let dateUrlPart = ''
    if(dateSelector.trim()){
        dateUrlPart = `/d/${encodeURIComponent(dateSelector.trim())}`
    }



    
    let removedTagsURLPart = ''



    if (removalSelectors.length) {
        removedTagsURLPart = `/r/${removalSelectors.map(item=>encodeURIComponent(item)).join(',')}`
    }

    finalUrl = `${originalUrl}#pr=c/${encodeURIComponent(contentSelector)}${titleURLPart}${removedTagsURLPart}${dateUrlPart}${authorUrlPart}`

    const fullUrlSpan = document.getElementById("full-url-span")
    fullUrlSpan.innerText = finalUrl




}

function guessParsingRules(){
    const match = originalUrl.match(/^(?<protocol>https?):\/\/(?<domain>[^/]+)\/?(?<rest>.*?)$/)

    if (!match) return null


    const domain = match.groups.domain


    let additionalForbiddenTags = []
    if (domain.includes('wikipedia.org')) {
        additionalForbiddenTags = ['.navbox','.sidebar', '.mw-editsection']
    }


    if (originalUrl.startsWith('https://www.gutenberg.org/') && originalUrl.endsWith('.txt')) {
        
        currentContent = originalContentString



        const titleMatch = currentContent.match(/^Title: (.*?)$/im)
        if (titleMatch) {
            currentTitle = titleMatch[1]
        }

        return {isText:true}


     }

    const sanitizedHtml = sanitizeHtml(originalContentString)


    const htmlParser = new DOMParser();
    const htmlDoc = htmlParser.parseFromString(sanitizedHtml, 'text/html');


    let contentEl = null;

    // Try each selector until one matches
    let selectorsThatWorked = []
    for (const sel of selectors) {
        contentEl = htmlDoc.querySelector(sel);
        if (contentEl) {
            selectorsThatWorked.push(sel)
        }
    }


    if (!contentEl) return;



    // Try multiple possible selectors for the page/post title
    const headerSelectors = [
        'h1',                        // plain h1
        'header h1',                 // h1 inside a <header>
        '.entry-title',               // common WP class
        '.post-title'                // another common one                  
    ];

    let headerEl = null;

    const titleSelectorsThatWorked = []
    for (const sel of headerSelectors) {
        headerEl = htmlDoc.querySelector(sel);
        if (headerEl) {
            titleSelectorsThatWorked.push(sel)
        }
    }


    return {isText:false,contentSelectors:selectorsThatWorked,titleSelectors:titleSelectorsThatWorked,additionalForbiddenTags}


}



function renderPage(){

    const [cleanUrl, configString] = finalUrl.split('#pr=')

    const urlInfo = getProtocolAndDomainFromUrl(cleanUrl)
    if(!urlInfo){
        showBlankPage()
        showToastMessage('Parsing error')
        return
    }


    const {protocol, domain} = urlInfo


    const actions = getActionsFromConfigString(configString)
    if(!actions){
        showBlankPage()
        return
    }


    const dataObject = parseHtmlStringWithConfig(originalContentString,configString,cleanUrl,protocol,domain,actions)

    if(!dataObject){
        showBlankPage()
        return
    }


    const pageDiv = document.getElementById("pageDiv")
   
    pageDiv.innerHTML = dataObject.isPlainText ? escapeHTML(dataObject.html) : dataObject.html
    

    const headerDiv = document.getElementById("pageHeader")
    populateHeaderDiv(headerDiv,dataObject.headerInfo)
    
    if (dataObject.isPlainText) {
        pageDiv.style.wordWrap = 'break-word'
        pageDiv.style.whiteSpace = 'pre-wrap' 
    } else {
        pageDiv.style.wordWrap = ''
        pageDiv.style.whiteSpace = ''
    }



    replaceMediaTagsWithLinksInDiv(pageDiv,'audio')
    replaceMediaTagsWithLinksInDiv(pageDiv,'video')

}



function showBlankPage(){
    const headerDiv = document.getElementById("pageHeader")
    headerDiv.innerHTML = ''
    const pageDiv = document.getElementById("pageDiv")
    pageDiv.innerHTML = ''

}



