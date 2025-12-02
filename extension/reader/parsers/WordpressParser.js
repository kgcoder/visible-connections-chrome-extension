/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

import { getXMLFromHeaderInfo } from "../HeaderMethods.js";
import { escapeXml, removeTitleFromContent, sanitizeHtml, showToastMessage } from "../helpers.js";
import { fetchWebPage } from "../NetworkManager.js";

export async function checkWorpressPostOrPage(originalUrl, configString, muteErrorMessage) {

    
    const cleanUrl = originalUrl.split('#')[0]

    const match = cleanUrl.match(/^(?<protocol>https?):\/\/(?<domain>[^/]+)(?:\/(?<rest>.*))?$/);

    if (!match) return null
    
    let post_id = null
    let slug = null
    const protocol = match.groups.protocol
    const variant = configString === 'wppost' ? 'posts' : 'pages'
    const domain = match.groups.domain
    let rest = match.groups.rest



    rest = rest.replace(/\/$/,'')

    const postMatch = rest.match(/^\?p=(?<post_id>.*?)$/)

    if(postMatch){
        post_id = postMatch.groups.post_id
    }else{
        const archiveMatch = rest.match(/^archives\/(?<post_id>.*?)$/)

        if(archiveMatch){
            post_id = archiveMatch.groups.post_id
        
        }else{
            const slugMatch = rest.match(/\/(?<slug>[^/]+)$/)
            if(slugMatch){
                slug = slugMatch.groups.slug
            }else if (rest.length > 0){
                slug = rest
            }

            if(!slug)return null

            if (slug.includes('?')) {
                slug = slug.replace(/\?.*?$/,'')
            }

        }

    }




    

    let finalUrl = ''
    if(post_id){
        finalUrl = `${protocol}://${domain}/wp-json/wp/v2/${variant}/${post_id}`
    }else if(slug){
        finalUrl = `${protocol}://${domain}/wp-json/wp/v2/${variant}?slug=${slug}`
    }

    if(!finalUrl)return null

    
   // g.crosshair.showSpinner()
    const result = await fetchWebPage(finalUrl) 
    
    if (!result) {
        if (!muteErrorMessage) {
            showToastMessage('Something went wrong')
        }
        return null
    }
    
    const {text:jsonString,error} = result

    if(error){

        if (!muteErrorMessage) {
            showToastMessage(error)
        }

        return null
    }
    

    if (!jsonString)return
     
    let json
    try {
        json = JSON.parse(jsonString)
        
    } catch (e) {
        return null
    }
    

   // g.crosshair.hideSpinner()
    



    let firstObject = null
    if(Array.isArray(json)){
        if (!json.length) {
            if (!muteErrorMessage) {
                showToastMessage('Page download failed')
            }
            return null
        }
        firstObject = json[0]
    }else if(json && typeof json === 'object'){
        firstObject = json
    }
    
    if (!firstObject) {
        if (!muteErrorMessage) {
            showToastMessage('Page download failed')
        }
        return null
    }


    let content = firstObject.content?.rendered

    if (!content) {
        if (!muteErrorMessage) {
            showToastMessage('Page download failed')
        }
        return null
    }


    const sanitizedHtml = sanitizeHtml(content)


    const commentStatus = firstObject.comment_status

    const title = firstObject.title?.rendered ?? ''


    const titleParser = new DOMParser();

    const titleDoc = titleParser.parseFromString(`<div>${title}</div>`, 'text/html');
    const sanitizedTitle = titleDoc.body.textContent.trim()



    const headerInfo = {h1Text:sanitizedTitle}

    content = removeTitleFromContent(sanitizedHtml,sanitizedTitle)

    let commentsSection = ''
    if (commentStatus === 'open') {
        let commentsUrl = ''

        const linksSection = firstObject._links

        if(linksSection){
            const replies = linksSection.replies
            if(replies && replies.length){
                const replyObj = replies[0]
                commentsUrl = replyObj.href
            }
        }

        commentsSection = commentsUrl ? `<comments title="Comments" empty="No comments yet">${escapeXml(commentsUrl)}</comments>` : ''
        
    }



    let headerString = getXMLFromHeaderInfo(headerInfo)

    headerString = headerString ? `\n\n${headerString}\n\n` : '\n\n'


    const xmlString = `<hdoc>\n\n<metadata>\n<title>${escapeXml(sanitizedTitle)}</title>\n</metadata>\n\n<panels>\n<top>\n<site-name href="${protocol}://${domain}">${domain}</site-name>\n</top>\n<side>${commentsSection}</side>\n</panels>${headerString}<content>${content}</content>\n\n</hdoc>`

    const dataObject = {html:content,headerInfo,xmlString,connectedDocsData:[],type:'text',url:originalUrl,docSubtype:3,docType:'h'}

    return dataObject


    
}


