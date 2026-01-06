# to build and run

docker compose -f docker-compose.local.yml up --build

# to build image

docker build -t khalids01/21s2mars:0.1.0 .

# test command

docker run --rm khalids01/21s2mars:0.1.0 --help || true
