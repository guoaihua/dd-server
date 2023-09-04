###  图片内容管理

1、管理系统上传图片
2、node获取图片名，生成图片路径，调用sqlite存储路径
3、node写入图片到相应的路径
4、接口查询根据条件调用sqlite查询数据库

### docker 创建

-p 宿主对外开发的端口:容器自身的端口
--mount 挂载主机目录到容器的虚拟目录
docker service create --replicas 3 -p 8009:9000 --name dd-photo-server --mount type=bind,source=/usr/share/nginx/images/dd-photo-pics,target=/usr/share/dd-data ziminga/dd-photo-server


### 
nginx 目录下面存放原始图片
/usr/share/images/

// dd头像专用图片存储目录
/dd-photo-pics

nginx 会将所有带有dd-photo-img前缀的图片请求发往 /dd-photo-pics下


### 更新图片资源到机器
 scp -r ./dd-photo-pics usr@119.45.234.109:/usr/share/nginx/images

