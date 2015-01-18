FROM node

ADD README.md /app/

RUN npm install -g grunt-cli

ADD package.json /app/
RUN cd /app && npm install

ADD Gruntfile.js /app/
ADD jsdoc.conf.json /app/
ADD /src /app/src/
ADD /test /app/test/

WORKDIR /app

CMD grunt