FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
#uncomment npm run build on VPS
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]