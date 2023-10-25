run:
	docker run -d -p 80:3000 --name decodeapp decodeapp:volumes
stop:
	docker stop decodeapp
