FROM node:20.8.0-alpine3.18

WORKDIR /app

COPY . .

RUN npm install && cd /app/server && npm install

RUN cd /app/client && npm install -g @angular/cli && npm install

COPY ./docker/start.sh /app/
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]