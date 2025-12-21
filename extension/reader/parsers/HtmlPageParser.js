/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

import { getXMLFromHeaderInfo } from "../HeaderMethods.js"
import { escapeXml, getBaseFromHtmlDoc, getBaseOuterXML, getH1TitleFromDoc, getProtocolAndDomainFromUrl, removeTitleFromContent, sanitizeHtml, showToastMessage } from "../helpers.js"
import { fetchWebPage } from "../NetworkManager.js"


export function getActionsFromConfigString(configString){
    const actions = []
    const chunks = configString.split('/')
    if (chunks.length % 2 !== 0) {
        showToastMessage('Something is wrong with the parsing config of the URL')
        return false
    }

    while (chunks.length) {
        const actionName = chunks.shift()
        const actionText = chunks.shift()
        actions.push({ action: actionName.toLowerCase(), text: actionText})
    }
    

    const selector = actions.find(item => item.action === 'c')?.text
    
    if (!selector) {
        showToastMessage('Something is wrong with the parsing config of the URL')
        return false
    }


    return actions

}
export async function getHtmlPageAndParseIt(configString,cleanUrl,muteErrorMessage = false) {
    const actions = getActionsFromConfigString(configString)

    if(!actions)return null
   
    const urlInfo = getProtocolAndDomainFromUrl(cleanUrl)
    if(!urlInfo){
        showToastMessage('Parsing error')
        return null
    }

    const {protocol, domain} = urlInfo
    
    const result = await fetchWebPage(cleanUrl)
    
    if (!result) {
        if (!muteErrorMessage) {
            showToastMessage('Something went wrong')
        }
        return null
    }

    const {text,error} = result


    if(error){
      
        if (!muteErrorMessage) {
            showToastMessage(error)  
        }

        return null
    }
    
    return parseHtmlStringWithConfig(text,configString,cleanUrl,protocol,domain,actions)
   
}



export function parseHtmlStringWithConfig(htmlString,configString,cleanUrl,protocol,domain,actions){
    console.log('actions',actions)
   let additionalForbiddenTags = []

    let titleSelector

    let authorName
    let publicationDate


    const sanitizedHtml = sanitizeHtml(htmlString)


    const unsanitizedHtmlParser = new DOMParser();
    const unsanitizedHtmlDoc = unsanitizedHtmlParser.parseFromString(htmlString, 'text/html');



    const htmlParser = new DOMParser();

    const htmlDoc = htmlParser.parseFromString(sanitizedHtml, 'text/html');

    let contentSelector

    actions.forEach(a => {
        if(a.action === 'c'){
            contentSelector = a.text
        }
        if (a.action === 'r') {
            const tags = decodeURIComponent(a.text).split(',')
            additionalForbiddenTags.push(...tags)
        }
        if (a.action === 't') {
            titleSelector = decodeURIComponent(a.text)
        }

        if (a.action === 'a') {
            try{
                const authorEl = htmlDoc.querySelector(decodeURIComponent(a.text));
                if(authorEl)authorName = authorEl.textContent
            }catch(e){
                //invalid selector
            }
        }

        if (a.action === 'd') {
            try{
                const dateEl = htmlDoc.querySelector(decodeURIComponent(a.text));
                if (dateEl) publicationDate = dateEl.textContent
            }catch(e){
                //invalid selector
            }
        }
        

    })

  
    
  
  
    let contentEl
    try{

        contentEl = htmlDoc.querySelector(decodeURIComponent(contentSelector));
        
        if (!contentEl) {
            showToastMessage('Parsing error')
            return null
        }

    }catch(e){
        showToastMessage('Something is wrong with parsing rules (#pr=...) for this page')
        return null
    }

    
    let contentHtml = sanitizeHtml(contentEl.innerHTML, additionalForbiddenTags)

    const titleText = getH1TitleFromDoc(htmlDoc, titleSelector) 
    

    const pageTitleFromHead = unsanitizedHtmlDoc.title ?? ''


    const content = removeTitleFromContent(contentHtml,titleText)

    const headerInfo = { h1Text: titleText }
    
    if (authorName) {
        headerInfo.authorName = authorName
    }

    if (publicationDate) {
        headerInfo.publicationDate = publicationDate
    }


    let headerString = getXMLFromHeaderInfo(headerInfo)

    headerString = headerString ? `\n\n${headerString}\n\n` : '\n\n'
        
    const base = getBaseFromHtmlDoc(unsanitizedHtmlDoc)

    
    const xmlString = `<hdoc>\n\n<metadata>\n<title>${escapeXml(pageTitleFromHead)}</title>\n${getBaseOuterXML(base)}</metadata>\n\n<panels>\n<top>\n<site-name href="${protocol}://${domain}">${domain}</site-name>\n</top>\n</panels>${headerString}<content>${content}</content>\n\n</hdoc>`

    const dataObject = {html:content,headerInfo,base,xmlString,connectedDocsData:[],type:'text',url:`${cleanUrl}#pr=${configString}`,docSubtype:3,docType:'h'}

    return dataObject
}