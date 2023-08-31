import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("pics", file as RcFile);
    });
    formData.append("dir", "/dogs");
    setUploading(true);
    // You can use any AJAX library you like
    fetch("http://localhost:9000/addPic", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setFileList([]);
        message.success("upload successfully.");
      })
      .catch(() => {
        message.error("upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
  };

  return (
    <div className="App">
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
    </div>
  );
}

export default App;
