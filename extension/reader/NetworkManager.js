/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

import g from './Globals.js'


const currentRequests = new Set()


export function fetchWebPage(url) {
  if(!g.readingManager.mainDocData)return

  if (currentRequests.has(url)) return
  currentRequests.add(url)


    
    
    return new Promise(async (resolve, reject) => {
        
        
        
        const currentPageUrl = g.readingManager.mainDocData.url
        const currentPageHostname = new URL(currentPageUrl).hostname
        
        try{
          const requestedPageHostname = new URL(url).hostname
          if (requestedPageHostname === currentPageHostname) {
          
              try {
                  const result = await fetch(url)
                  const text = await result.text()
          
                  currentRequests.delete(url)
                  resolve({text, error:''})
                  
              } catch (e) {
                  currentRequests.delete(url)
                  resolve({error:e, text:''})
              }
  
          
              return
          
           }

        }catch(e){
          resolve({error:e, text:'Something is wrong with the URL'})
        }





    const id = Math.random().toString(36).slice(2);

      function handleResponse(event) {
      if (event.source !== window) return;
      const msg = event.data;
      if (msg.type === "FETCH_RESULT" && msg.id === id) {
        window.removeEventListener("message", handleResponse);
        currentRequests.delete(msg.url)
        resolve({text:msg.html,error:msg.isError ? msg.html : null});
      }

      
    }

    window.addEventListener("message", handleResponse);
    window.postMessage({ type: "FETCH_WEB_PAGE", url, id }, "*");
  });
}