args = "$@"

docker compose down &&
docker compose up sqlc --build &&
BUILDKIT_INLINE_CACHE=1 docker compose up backend --build --force-recreate $args
