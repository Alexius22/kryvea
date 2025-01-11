<p align="center">
  <a href="https://github.com/Alexius22/kryvea">
     <picture>
       <img width="90" src="assets/logo.svg" /></a>
    </picture>
  </a>
  <br />
  <b>kryvea</b>
  <br /> <br />
</p>
<h4 align="center">The reporting platform you never expected</h3>

---

## Application architecture
### Images
The app is composed of 3 different images:
- **kryvea-app** is the main container and contains the application code. This is what you want to modify if you want to edit the code.
No data is kept within this container, so you can freely recreate it multiple times without losing data.
- **kryvea-nginx** contains the nginx reverse proxy to the main application, you may want to edit the `nginx.conf` file, even though it's unlikely you'll ever need to.
- **kryvea-db** contains the postgres DB which holds all the data of the application. In 99.9% of the cases you don't need to touch it.

The images share an internal network to communicate and only the port 443 from the xdefense-nginx container is exposed to the host.

### Docker Compose
You can run `kryvea` by using the provided docker-compose file:

- Edit the variables inside the file `docker-compose.yml` to change your preferred configuration, e.g. choose which port to expose (80/443)
- <ins>**Do not forget to change the default passwords in the .yml file**</ins>
- Start the app with:
```bash
docker compose up
```