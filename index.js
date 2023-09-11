const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multiparty = require("multiparty");
const themesMap = {};
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

const commonPicLibs = () => {
  // const ddServerImagePath = "/Users/ziming/Desktop/dd-photo-pics";
  const ddServerImagePath = "/usr/share/dd-data";
  // 读取当前目录的信息，返回图片的路径信息
  const arr = fs.readdirSync(path.resolve(ddServerImagePath), {
    withFileTypes: true,
    recursive: true,
  });
  if (Array.isArray(arr) && arr.length > 0) {
    // 先解析一层，即文件夹如果有多层则会忽
    arr.forEach((item) => {
      if (item.isDirectory()) {
        // 读取该文件夹下面的文件
        const fileChildren = fs.readdirSync(
          path.resolve(ddServerImagePath, item.name),
          { withFileTypes: true }
        );
        themesMap[item.name] = fileChildren
          ?.filter((i) => !i.isDirectory())
          ?.map((i) => `/${item?.name}/${i?.name}`);
      }
    });
  }
};
commonPicLibs();

setInterval(() => {
  //  一个小时手动刷新一下， 防止图片库更新
  commonPicLibs();
}, 1000 * 60 * 60);

app.use(express.static("images"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

app.get("/getPics", (req, res) => {
  res.send({
    themesMap,
  });
});

app.post("/addPic", (req, res) => {
  var form = new multiparty.Form({
    uploadDir: path.resolve(__dirname, "./images"),
  });
  const namesMap = {
    dog: '狗'
  }
  form.parse(req, function (err, fields, files) {
    console.log(files);
    if (Array.isArray(files?.pics)) {
      files?.pics.forEach((element) => {
        fs.renameSync(
          element?.path,
          form?.uploadDir + fields?.dir + "/" + element.originalFilename
        );
        const url = `http://localhost:9000${
          fields?.dir + "/" + element.originalFilename
        }`;
        console.log(url);
      });
    }
  });

  res.send({
    message: "ok",
  });
});

app.listen(9000, () => {
  console.log("server is running");
});
