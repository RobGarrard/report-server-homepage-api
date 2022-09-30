.PHONY: docker-container

docker-container:
	@echo "Building Dockerfile.\n"
	
	sudo -E docker build \
	--build-arg GIT_REVISION=$(git rev-parse HEAD) \
	--build-arg report_server_aws_key=${report_server_aws_key} \
	--build-arg report_server_aws_secret=${report_server_aws_secret} \
	--build-arg POSTGRES_HOST=${POSTGRES_HOST} \
	--build-arg POSTGRES_USER=${POSTGRES_USER} \
	--build-arg POSTGRES_PWD=${POSTGRES_PWD} \
	-t report-server-homepage-api . ;

start-api:
	@echo "Starting API container in detached mode.\n"
	sudo docker run \
	-dti \
	-p 9001:9001 \
	--restart unless-stopped \
	--name report-server-homepage-api \
	report-server-homepage-api;

stop-api:
	@echo "Stopping API container.\n"
	sudo docker stop report-server-homepage-api

remove-api-container:
	@echo "Removing api container.\n"
	sudo docker rm report-server-homepage-api

rebuild-container:
	make stop-api
	make remove-api-container
	make docker-container
	make start-api
