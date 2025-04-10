args = "$@"

docker compose down raptorchat-backend-1 2> /dev/null;
DOCKER_BUILDKIT=1 bUILDKIT_INLINE_CACHE=1 docker compose up backend --build $args
