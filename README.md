# DynamicWallpaper
macOS-style time &amp; location based dynamic wallpaper template for Wallpaper Engine.

## Examples
- [Mojave](https://steamcommunity.com/sharedfiles/filedetails/?id=1545776827)

- [Solar Gradients](https://steamcommunity.com/sharedfiles/filedetails/?id=1545628104)

## Usage
1. Place the wallpaper images in /img folder. Name them from 1.png to n.png in order
2. Edit the metadatas in control.js: specify total image numbers(imgCount) and image No. for dawn(sunriseImgNo) & dusk(sunsetImgNo)
3. Copy the total image numbers to the "max" property of the first "customint" entry (which has "text": "Static Image Number") in project.json
4. Import the folder as a web wallpaper in Wallpaper Engine
