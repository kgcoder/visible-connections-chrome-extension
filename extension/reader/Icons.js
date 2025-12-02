/*
Visible Connections Chrome Extension
Copyright (c) 2025 Karen Grigorian
Licensed under the MIT License (code)

This extension uses document types defined by the Default Web project.
All Default Web document types (current and future) are licensed under CC BY-ND 4.0.

For the official list of document types and specifications, see:
https://github.com/kgcoder/default-web
*/

const pixelRatio = window.devicePixelRatio;

class IconsInfo{

    loadImage(src1x, src2x, src3x) {
        let path
        const img = new Image();
        if (pixelRatio >= 3) {
            path = src3x;
        } else if (pixelRatio >= 2) {
            path = src2x;
        } else {
            path = src1x;
        }
    
    
        img.onload = () => {
            img.isLoaded = true
        }
    
    
    
        return img;
    }
    
    pathForImage(src1x) {
        let result = ''
        if (pixelRatio >= 3) {
            result = src1x.replace('.png','@3x.png')
        } else if (pixelRatio > 1) {
            result = src1x.replace('.png','@2x.png')
        } else {
            result = src1x;
        }
        
     
        return new URL(result, import.meta.url).href;

    }
    


    loadAllIcons = async () => {
        this.icons = {
           
     
           
        };
        
        this.iconPaths = {

   



        
            ic_search_up: this.pathForImage("./images/documents/ic_search_up.png"),
            ic_search_down: this.pathForImage("./images/documents/ic_search_down.png"),

            ic_audio: this.pathForImage("./images/documents/ic_audio.png"),
            ic_video: this.pathForImage("./images/documents/ic_video.png"),
        
            ic_bucket_button: this.pathForImage("./images/reader/ic_bucket_button.png"),

            ic_download_all: this.pathForImage("./images/reader/ic_download_all.png"),

            ic_frame: this.pathForImage("./images/reader/ic_frame.png"),


        
            ic_exclamation: this.pathForImage("./images/reader/ic_exclamation.png"),

            ic_crosshair: this.pathForImage("./images/reader/ic_crosshair.png"),
            ic_source_code: this.pathForImage("./images/reader/ic_source_code.png"),
            ic_source_code_white: this.pathForImage("./images/reader/ic_source_code_white.png"),
            ic_edit: this.pathForImage("./images/reader/ic_edit.png"),
            ic_export: this.pathForImage("./images/reader/ic_export.png"),
            ic_export_white: this.pathForImage("./images/reader/ic_export_white.png"),
            ic_fullscreen_open: this.pathForImage("./images/reader/ic_fullscreen_open.png"),
            ic_fullscreen_close: this.pathForImage("./images/reader/ic_fullscreen_close.png"),
            ic_info: this.pathForImage("./images/reader/ic_info.png"),
            ic_info_white: this.pathForImage("./images/reader/ic_info_white.png"),
            ic_left_panel: this.pathForImage("./images/reader/ic_left_panel.png"),
            ic_right_panel: this.pathForImage("./images/reader/ic_right_panel.png"),
            ic_multiple_docs: this.pathForImage("./images/reader/ic_multiple_docs.png"),
            ic_close: this.pathForImage("./images/reader/ic_close.png"),
            ic_search: this.pathForImage("./images/reader/ic_search.png"),
            ic_download: this.pathForImage("./images/reader/ic_download.png"),
        
            ic_sort_triangle: this.pathForImage("./images/reader/ic_sort_triangle.png"),
            ic_sort_triangle_light: this.pathForImage("./images/reader/ic_sort_triangle_light.png"),
            ic_flinks_list_button: this.pathForImage("./images/reader/ic_flinks_list_button.png"),
        
            ic_big_search: this.pathForImage("./images/reader/ic_big_search.png"),
        
        }

    }
    

}


export default IconsInfo