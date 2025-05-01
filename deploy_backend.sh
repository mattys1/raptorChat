args="$@"

docker compose down &&
docker compose up sqlc --build &&
DOCKER_BUILDKIT=1 BUILDKIT_INLINE_CACHE=1 docker compose up backend --force-recreate --build $args
