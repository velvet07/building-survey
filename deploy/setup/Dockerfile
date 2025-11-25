# Setup Container - PHP with PostgreSQL support
FROM php:8.2-apache

# Install PostgreSQL client and PDO driver
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite (optional, but good practice)
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# The actual setup files will be mounted via volume
