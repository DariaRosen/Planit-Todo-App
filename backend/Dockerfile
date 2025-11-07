# This file helps to run my app using PHP 8, serve all files from /backend, and listen on port 10000.

# Use official PHP 8 image with Apache
FROM php:8.2-apache

# Copy your backend files into the container
COPY . /var/www/html/

# Expose port 10000 for Render
EXPOSE 10000

# Start PHP's built-in server
CMD ["php", "-S", "0.0.0.0:10000", "-t", "/var/www/html"]
