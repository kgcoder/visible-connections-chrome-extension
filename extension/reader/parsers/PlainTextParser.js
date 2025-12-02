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
import { escapeXml, showToastMessage } from "../helpers.js"
import { fetchWebPage } from "../NetworkManager.js"


export async function getPlainTextPageAndParseIt(cleanUrl,muteErrorMessage = false) {
  
    const match = cleanUrl.match(/^(?<protocol>https?):\/\/(?<domain>[^/]+)\/?(?<rest>.*?)$/)

    if (!match) {
        showToastMessage('Parsing error')
        return null
    }


    const protocol = match.groups.protocol
    const domain = match.groups.domain
    

    // g.crosshair.showSpinner()
    
    const result = await fetchWebPage(cleanUrl)
    
    if (!result) {
        if (!muteErrorMessage) {
            showToastMessage('Something went wrong')
        }
        return null
    }
    
    const {text,error} = result
   // g.crosshair.hideSpinner()

    if(error){
       
        if (!muteErrorMessage) {
            showToastMessage(error)  
        }

        return null
    }


    const content = text

    let headerInfo = {}


    const titleMatch = content.match(/^Title: (.*?)$/im)
    if (titleMatch) {
        headerInfo.h1Text = titleMatch[1]
    }


    const finalUrl = `${cleanUrl}#pr=text`


    let headerString = getXMLFromHeaderInfo(headerInfo)

    headerString = headerString ? `\n\n${headerString}\n\n` : '\n\n'

    
    const xmlString = `<hdoc>\n\n<metadata>\n<title>${escapeXml(headerInfo.h1Text ?? '')}</title>\n</metadata>\n\n<panels>\n<top>\n<site-name href="${protocol}://${domain}">${domain}</site-name>\n</top>\n</panels>${headerString}<content type="text">${content}</content>\n\n</hdoc>`

    const dataObject = {html:content,headerInfo,xmlString,connectedDocsData:[],type:'text',url:finalUrl,docSubtype:3,docType:'h',isPlainText:true}

    return dataObject
    
   
}


