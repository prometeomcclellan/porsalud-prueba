import { Component } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

// <preference name="orientation" value="portrait" />

const IMG_DIR= 'fotos-por-salud';
const fileName = new Date().getTime() + '.jpeg';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  selectedImage: any;
  photos: any;
  isPhoto: any;
  isLogo: any;
  isText: any;
  
  constructor(private platform: Platform){
    this.platform.backButton.subscribeWithPriority(1, () => {
      if(this.isPhoto == true){
        this.isPhoto = false;
        this.isLogo = true;
        this.isText = false;
      }else{
    
        App.exitApp();
    
      }
      
    });
  }



  ngOnInit(){
    this.isPhoto = false;
    this.isLogo = true;
  }

  checkPlatformForWeb() {
    if(Capacitor.getPlatform() == 'web') return true;
    return false;
  }

  processNextHandler(){
    this.isPhoto = false;
    this.isLogo = true;
  }

   takePicture = async () => {
    
    
    
    const image = await Camera.getPhoto({
      quality: 90,
      source: CameraSource.Prompt,
      width: 600,
      resultType: this.checkPlatformForWeb() ? CameraResultType.DataUrl : CameraResultType.Uri
    });
  
    console.log('image : ', image);
    this.selectedImage = image;
    if(this.checkPlatformForWeb()) this.selectedImage.webPath = image.dataUrl

    if(image){
      this.isPhoto = true;
      this.isLogo = false;
      this.savePicture(this.selectedImage, fileName);
    }
    
  }

  async savePicture(photo: Photo, filename: any) {
    const base64Data = await this.readAsBase64(photo);
    const path = `${IMG_DIR}/${fileName}`;
    console.log(base64Data);
    console.log('mi archivo se llama :' + filename);
    console.log('y se almacenará en :' + path);

    try {
      let ret = await Filesystem.mkdir({
        path: 'mis-fotos',
        directory: Directory.Data,
        recursive: false,
      });
      console.log("folder ", ret);
    } catch (e) {
      //console.error("Unable to make directory", e);
    }
    
    /*
    const savedFile = await Filesystem.writeFile({
      path: `${IMG_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });

    console.log('saved file ' + savedFile);
    */
  }

  private async readAsBase64(photo: Photo) {
    
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
  
      return await this.convertBlobToBase64(blob) as string;
    
  }

    
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};
