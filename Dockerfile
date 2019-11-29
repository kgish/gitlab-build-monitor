FROM 280925583500.dkr.ecr.eu-central-1.amazonaws.com/nginx-spa:1.6.2

ENV APPLICATION_NAME=gitlab-build-monitor

COPY build /usr/share/nginx/html/gitlab-build-monitor
