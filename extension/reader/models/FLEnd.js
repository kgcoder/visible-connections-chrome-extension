/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

import FLPointEnd from "./FLPointEnd.js"
import FLTextEnd from "./FLTextEnd.js"

class FLEnd{

    static fromObject(object){
        const {t:type} = object
        if(type === 't'){
            return FLTextEnd.fromObject(object)
        }else if(type === 'p'){
            return FLPointEnd.fromObject(object)
        }
    }


}

export default FLEnd