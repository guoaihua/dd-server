const express = require("express");
const app = express();
const axios = require("axios");
const request = require("request");
const fs = require("fs");
const path = require("path");
const multiparty = require("multiparty");
const bodyParser = require("body-parser");
const FormData = require("form-data");

const themesMap = {};
let accessToken = "";

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

app.use(bodyParser.urlencoded({ extended: false, limit: "2mb" }));
app.use(
  bodyParser.json({
    limit: "2mb",
  })
);

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

// 获取微信access_token
const refreshToken = () => {
  axios
    .get("https://api.weixin.qq.com/cgi-bin/token", {
      params: {
        grant_type: "client_credential",
        appid: "wx69abccfa61662325",
        secret: "18e0cd0fcb42ccf28fc2faffc7d42006",
      },
    })
    .then(({ data }) => {
      console.log(data);
      accessToken = data?.access_token;
    });
};
refreshToken();

setInterval(() => {
  //  2个小时手动刷新一下， 防止图片库更新
  commonPicLibs();
  // access_token 的有效期目前为 2 个小时，需定时刷新，重复获取将导致上次获取的 access_token 失效；
  // 中控服务器去刷新token，同时刷新容易导致相互覆盖，多个pod最后只有一个生效
  refreshToken();
}, 1000 * 60 * 60 * 2);

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

app.get("/login", (req, res) => {
  console.log(req.query);

  axios
    .get("https://api.weixin.qq.com/sns/jscode2session", {
      params: {
        grant_type: "authorization_code",
        appid: "wx69abccfa61662325",
        secret: "18e0cd0fcb42ccf28fc2faffc7d42006",
        js_code: req.query.code,
      },
    })
    .then(({ data }) => {
      res.send(data);
    });
});

app.post("/checkImg", (req, res) => {
  const imgBuffer = Buffer.from(req.body.img, "base64");
  request(
    {
      method: "post",
      url: `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${accessToken}`,
      formData: {
        media: {
          options: {
            filename: "topsecret.jpg",
            contentType: "image/png",
          },
          value: imgBuffer,
        },
      },
    },
    (error, response, body) => {
      console.log(error, body);
      res.send(body);
    }
  );
});

app.get("/checkMsg", (req, res) => {
  request(
    {
      method: "post",
      url: `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`,
      headers: {
        "Content-Type": "application/json",
      },
      json: true,
      body: {
        content: req.query.message,
      },
    },
    (error, response, body) => {
      res.send(body);
    }
  );
});

app.post("/addPic", (req, res) => {
  var form = new multiparty.Form({
    uploadDir: path.resolve(__dirname, "./images"),
  });
  const namesMap = {
    dog: "狗",
  };
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
});

app.listen(9000, () => {
  console.log("server is running");
});
