import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';


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
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
})
export class HomePage {

  selectedImage: any;
  photos: any;
  isPhoto: any;
  isLogo: any;
  isText: any;
  descrip: any;
  now = new Date();
  rightNow = this.now.getDate() +'::'+ this.now.getTime();
  
  
  constructor(private platform: Platform, location: Location){
    console.log()
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
    //this.printCurrentPosition();
  }

  checkPlatformForWeb() {
    if(Capacitor.getPlatform() == 'web') return true;
    return false;
  }

  
  processNextHandler(){
    this.isPhoto = false;
    this.isLogo = true;
  }

  saveDescription(){
    this.isText = true;
    console.log(this.descrip)

    this.now = new Date();
    this.rightNow = this.now.getDate() +'/'+ this.now.getMonth() +'/'+ this.now.getFullYear() +'::'+ this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
    
  }

  checkChange(){

  }

  takePicture = async () => {
    this.isText = false;
    this.descrip = '';
    const image = await Camera.getPhoto({
      quality: 90,
      source: CameraSource.Prompt,
      width: 600,
      resultType: this.checkPlatformForWeb() ? CameraResultType.DataUrl : CameraResultType.Uri
    });
  
    console.log('image:', image);
    this.selectedImage = image;
    if (this.checkPlatformForWeb()) {
      this.selectedImage.webPath = image.dataUrl;
    }
  
    if (image) {
      this.isPhoto = true;
      this.isLogo = false;
      await this.savePicture(this.selectedImage);
    }
  }
  
  async savePicture(photo: Photo) {
    const fileName = new Date().getTime() + '.jpeg'; // Generate a unique filename
    const path = `${Directory.Data}/mis-fotos/${fileName}`;
  
    try {
      await Filesystem.mkdir({
        path: 'mis-fotos',
        directory: Directory.Data,
        recursive: false,
      });
    } catch (e) {
      console.error("Unable to make directory", e);
      return;
    }
  
    const base64Data = await this.getBase64Data(photo);
  
    try {
      await Filesystem.writeFile({
        path: path,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
      });
  
      console.log('Photo saved successfully:', path);
    } catch (e) {
      console.error("Unable to save photo", e);
    }
  }
  
  private async getBase64Data(photo: Photo): Promise<string> {
    if (this.checkPlatformForWeb()) {
      return photo.dataUrl?.split(',')[1] || '';
    } else {
      if (photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const reader = new FileReader();
  
        return new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Unable to read photo as base64'));
            }
          };
  
          reader.readAsDataURL(blob);
        });
      } else {
        return '';
      }
    }
  }
/*
   takePicture = async () => {
    this.isText = false;
    this.descrip = '';
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

      await this.savePicture(this.selectedImage, new Date().getTime() + '.jpeg');
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
  */
};
