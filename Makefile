all: up

up:
	docker compose -f ./docker/docker-compose.yml up
build:
	docker compose -f ./docker/docker-compose.yml up --build
down:
	docker compose -f ./docker/docker-compose.yml down
downv:
	docker compose -f ./docker/docker-compose.yml down -v
delete: downv
	rm -rf ./docker/db
prune:
	docker system prune -a
purge:
	docker volume prune
ls:
	docker image ls
	docker ps
re: down up

.PHONY: all, up, build, down, downv, prune, purge, re, delete, ls
