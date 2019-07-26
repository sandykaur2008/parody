FROM node:10

RUN mkdir /code
WORKDIR /code
COPY package*.json /code/
RUN npm install
COPY . /code/
RUN chmod +x boot.sh

EXPOSE 4000
ENTRYPOINT ["./boot.sh"]