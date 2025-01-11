FROM nginx:latest

COPY tls_certs.sh /docker-entrypoint.d/tls_certs.sh
RUN chmod +x /docker-entrypoint.d/tls_certs.sh

COPY nginx.conf /etc/nginx

RUN mkdir -p /var/www/html/kryvea/static

# create the appropriate directories
ENV APP_HOME=/var/www/kryvea/html
RUN mkdir -p $APP_HOME
RUN mkdir -p $APP_HOME/static
WORKDIR $APP_HOME

# chown all the files to the app user
RUN chown -R nginx:nginx /var/www/kryvea
