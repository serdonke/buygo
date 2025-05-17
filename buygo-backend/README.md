# Run backend
- Install docker
- Pull the redis image, that is what we use to hydrate tile38
- Pull and run tile38 docker image

```sh
sudo docker run --name buygo-redis -p 6379:6379 \
  -v $PWD/redis-data:/data \ # Well idk if I should add this thang to the repo
  redis redis-server --appendonly yes

docker pull tile38/tile3
docker run -p 9851:9851 tile38/tile38
```

- Run the backend
```sh
go run server.go
```
