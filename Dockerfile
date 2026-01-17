# Menggunakan image PHP resmi sebagai dasar
FROM php:8.2-fpm

# Install library sistem yang dibutuhkan Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Bersihkan cache agar image lebih kecil
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ekstensi PHP yang dibutuhkan
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Ambil Composer (Manajer paket PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set folder kerja di dalam container
WORKDIR /var/www

# Salin semua file project ke dalam container
COPY . .

# Install dependency Laravel via Composer
RUN composer install

# Ubah hak akses folder storage agar bisa ditulisi
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
