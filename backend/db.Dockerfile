FROM mysql:8.0.29

COPY ./docker/mysql/my.cnf /etc/mysql/my.cnf
EXPOSE 3306
