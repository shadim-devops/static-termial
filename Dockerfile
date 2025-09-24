FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY public/ /usr/share/nginx/html/
