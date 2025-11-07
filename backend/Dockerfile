# This file helps to run my app using PHP 8, serve all files from /backend, and listen on port 10000.

# Use official PHP 8.2 image with Apache
FROM php:8.2-apache

# Install mysqli and pdo_mysql extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql && docker-php-ext-enable mysqli pdo_mysql

# Copy your backend files into the container
COPY . /var/www/html/

# Expose port 10000 for Render
EXPOSE 10000

# Start PHP's built-in server
CMD ["php", "-S", "0.0.0.0:10000", "-t", "/var/www/html"]

