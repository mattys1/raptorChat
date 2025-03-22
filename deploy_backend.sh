args = "$@"

docker compose down &&
docker compose up sqlc --build &&
DOCKER_BUILDKIT=1 bUILDKIT_INLINE_CACHE=1 docker compose up backend --build --force-recreate $args
