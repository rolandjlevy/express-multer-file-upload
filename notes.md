## TODO

#### use Sharp to create thumbnail images
- https://www.npmjs.com/package/sharp
- https://sharp.pixelplumbing.com/


> File upload with Multer: 
* [npm](https://www.npmjs.com/package/multer)
* [Good tutorial](https://medium.com/@TheJesseLewis/how-to-make-a-basic-html-form-file-upload-using-multer-in-an-express-node-js-app-16dac2476610)
* [tutorial](https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088)
* [tutorial](https://bezkoder.com/node-js-express-file-upload/)
* [tutorial](https://www.section.io/engineering-education/uploading-files-using-multer-nodejs/)


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