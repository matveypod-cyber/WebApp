FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# Копируем файлы проекта
COPY public /usr/share/nginx/html/public
COPY src /usr/share/nginx/html/src
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]