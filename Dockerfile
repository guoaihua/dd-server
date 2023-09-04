FROM node:latest
COPY package*.json .
# RUN cd ./server && npm install --registry=https://registry.npm.taobao.org
RUN npm install
COPY . .
EXPOSE 8000
CMD ["node", "./index.js" ]
