server {
    listen 80;
    index index.php index.html;
    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;

    # Ini harus mengarah ke folder public di dalam container, BUKAN di laptop/host
    root /var/www/public;

    # Pengaturan agar URL Laravel yang "cantik" bisa berjalan
    location / {
        try_files $uri $uri/ /index.php?$query_string;
        gzip_static on;
    }

    # Bagian ini yang menghubungkan Nginx dengan Container PHP (Laravel)
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;

        # PENTING: "app" di sini merujuk pada nama service di docker-compose.yml
        # Jika di docker-compose nama servicenya "laravel", ganti jadi "laravel:9000"
        fastcgi_pass app:9000;

        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}
