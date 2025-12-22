/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

import { showToastMessage } from "../helpers.js";
import { fetchWebPage } from "../NetworkManager.js";
import { parseCDOC } from "./CDOCParser.js";
import { parseCondoc } from "./CondocParser.js";
import { getHdocJsonAndContentFromHtml, getHtmlPageWithHDocAndParseIt } from "./EmbHDOCParser.js";
import { parseHDOC } from "./HDOCParser.js";
import { getHtmlPageAndParseIt } from "./HtmlPageParser.js";
import { getPlainTextPageAndParseIt } from "./PlainTextParser.js";
import { checkWorpressPostOrPage } from "./WordpressParser.js";



export async function loadStaticContentFromUrl(originalUrl, muteErrorMessage = false){

    const configMatch = originalUrl.match(/^([^#]+)#pr=(.*?)$/)

    if (configMatch) {

        //const allowedKeys = ['c','t','r','a','d']

        const cleanUrl = configMatch[1]
        
        let configString = configMatch[2]

        // if (configString === 'wppost' || configString === 'wppage') {
        //     const dataObject = await checkWorpressPostOrPage(originalUrl,configString,muteErrorMessage)
        //     if (dataObject) return dataObject
        //     return  
        // }


        if (configString === 'text') {
            const dataObject = await getPlainTextPageAndParseIt(cleanUrl, muteErrorMessage)
            if (dataObject) return dataObject
            return
        }


    

    
        const dataObject = await getHtmlPageAndParseIt(configString,cleanUrl)
         
        if (dataObject) return dataObject
        return

        
       

    }else if (originalUrl.includes('#')) {
        originalUrl = originalUrl.split('#')[0]
    }

    originalUrl = originalUrl.replace(/\?$/,'')

    let dataObject

    const result = await fetchWebPage(originalUrl)

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
        
        return
    }

     dataObject = await parseStaticContent(text,originalUrl)
    


    if(!dataObject){
        //showToastMessage('Something is wrong with this collage (while parsing)',text)
        return
    }


    
    if(dataObject.type === 'text'){
        const {html,xmlString,connectedDocsData} = dataObject

        if(html.includes('<parsererror')){
            showToastMessage('Error while parsing HTML')
            return
        }

        if(xmlString.includes('<parsererror')){
            showToastMessage('Error while parsing XML')
            return
        }

        if(connectedDocsData.includes('<parsererror')){
            showToastMessage('Error while parsing connected documents data')
            return
        }

    }


    

    return dataObject
    


}


export async function parseStaticContent(contentString, originalUrl) {
    
    const condocMatch = contentString.match(/<condoc\b[^>]*>([\s\S]*?)<\/condoc>/im)
    const collageMatch = contentString.match(/<cdoc\b[^>]*>([\s\S]*?)<\/cdoc>/im)
    const hdocMatch = contentString.match(/<hdoc\b[^>]*>([\s\S]*?)<\/hdoc>/im)

    const htmlMatch = contentString.match(/<html\b[^>]*>([\s\S]*?)<\/html>/im)




    if (condocMatch) {
        contentString = condocMatch[0]
        return parseCondoc(originalUrl, contentString)
    }else if  (!collageMatch && hdocMatch) {
        contentString = hdocMatch[0]
        return parseHDOC(originalUrl, hdocMatch[0])
    } else if (collageMatch && !hdocMatch) {
        contentString = collageMatch[0]
        return  await parseCDOC(originalUrl, collageMatch[0])
    } else if (htmlMatch) {
        
        const dataFromEmbeddedHDOC = getHdocJsonAndContentFromHtml(contentString)
        if (dataFromEmbeddedHDOC) {
            const {hdocDataJSON,content} = dataFromEmbeddedHDOC
            return getHtmlPageWithHDocAndParseIt(originalUrl, content, hdocDataJSON)            
        }


        showToastMessage('Wrong document format')
        return null

     

    }else if(!collageMatch && !hdocMatch) {
        showToastMessage('Wrong document format')
        return null
    }   

    return null
}