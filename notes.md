## TODO

[-] Fix rotation issue
[-] When someone clicks on a thumbnail image it displays the original 

[+] use Sharp to create thumbnail images
- https://www.npmjs.com/package/sharp
- https://sharp.pixelplumbing.com/

## Reference

> Multer file uploader
* [npm](https://www.npmjs.com/package/multer)
* [Good tutorial](https://medium.com/@TheJesseLewis/how-to-make-a-basic-html-form-file-upload-using-multer-in-an-express-node-js-app-16dac2476610)
* [tutorial](https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088)
* [tutorial](https://bezkoder.com/node-js-express-file-upload/)
* [tutorial](https://www.section.io/engineering-education/uploading-files-using-multer-nodejs/)

> Sharp image resizer for thumbnail images

- [Documentation](https://sharp.pixelplumbing.com/api-output)
- Excellent tutorial example: [Node Express Image Upload And Resize](https://appdividend.com/2019/02/14/node-express-image-upload-and-resize-tutorial-example/)

- https://gist.github.com/kethinov/6658166
```javascript
const walkSync = function(dir, flist) {
  const files = fs.readdirSync(dir);
  let filelist = flist || [];
  files.forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const test = walkSync('public/uploads');
console.log(test);

```