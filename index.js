const  express = require("express");
const app = express();
const axios = require("axios")
const fs = require('fs')
const path = require("path")
const multiparty = require('multiparty');

// const sqlite3 = require('sqlite3').verbose();
 
// // 创建数据库连接
// const db = new sqlite3.Database(path.resolve(__dirname, './db/pics.db'));
 
// // 执行查询操作
// db.all('SELECT * FROM your_table', [], (err, rows) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(rows);
//   }
// });
 
// // 关闭数据库连接
// db.close();
app.use(express.static('images'))

app.use((req,res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');  
    res.header('Access-Control-Allow-Methods', 'GET, POST');  
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');  
    next();  
})

app.get('/getPics', (req, res)=>{
    res.send({
        message: 'ok'
    })
})

app.post('/addPic', (req, res)=>{
    var form = new multiparty.Form({uploadDir: path.resolve(__dirname, './images')});
    form.parse(req, function(err, fields, files) {
    console.log(files)

            if(Array.isArray(files?.pics)){
                files?.pics.forEach(element => {
                    fs.renameSync(element?.path, form?.uploadDir  + fields?.dir + '/' + element.originalFilename)
                    const url = `http://localhost:9000${fields?.dir + '/' + element.originalFilename}`
                    console.log(url)
                });
            }
      });

    res.send({
        message: 'ok'
    })
})


app.listen(9000, ()=>{
    console.log('server is running')
})