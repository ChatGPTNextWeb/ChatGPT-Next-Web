server {

	root /var/www/html;

	index index.html index.htm index.nginx-debian.html;

	server_name keytomarvel.com www.keytomarvel.com;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}


    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/keytomarvel.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/keytomarvel.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.keytomarvel.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = keytomarvel.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


	listen 80 default_server;
	listen [::]:80 default_server;

	server_name keytomarvel.com www.keytomarvel.com;
    return 404; # managed by Certbot




}