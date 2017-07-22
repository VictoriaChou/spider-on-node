const http = require('http');
const fs = require('fs');
const path = require('path');
http.get('http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1', (res) => {
    const { statusCode } = res; //es6属性的简洁表示法，对象名为变量名，对象值为变量值
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('Requset Failed.\n' +
            `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) { //判断是不是JSON
        error = new Error('Invalid content-type.\n' +
            `Expected application/json but received ${contentType}`);
    }
    if (error) {
        console.log(error.message);
        res.resume();
        return;
    }
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            const img = parsedData.images[0];
            const arr = img.url.split('/');
            const imgName = arr[arr.length-1];
            console.log(img.url);
            http.get("http://cn.bing.com"+img.url,(res) => {
                res.pipe(fs.createWriteStream(path.join('./img', imgName)));
            })
        } catch(e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});