FROM node:18

WORKDIR /app

ENV OPENAI_API_KEY=""
ENV CODE=""

COPY . ./

RUN yarn && yarn build

EXPOSE 3000

CMD ["yarn","start"]
