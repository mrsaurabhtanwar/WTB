# Overview

This is a WhatsApp automation bot designed for a tailoring shop to handle customer notifications and order management. The bot uses WhatsApp Web.js to integrate with WhatsApp and provides automated messaging capabilities for order status updates, primarily supporting Hindi language communications. It's built as a Node.js Express application optimized for cloud deployment on platforms like Railway and Azure.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Application Structure
The system follows a modular Node.js architecture with the main server (`server.js`) handling HTTP endpoints and webhook integrations, while the WhatsApp functionality is encapsulated in a dedicated client class (`whatsapp-client.js`). The application uses Express.js as the web framework to expose REST endpoints for health checks, QR code authentication, and webhook processing.

## WhatsApp Integration Layer
The WhatsApp client implementation uses the whatsapp-web.js library with Puppeteer for browser automation. The architecture supports multiple deployment strategies including local Chrome instances, external browser services via WebSocket endpoints, and containerized environments. Session persistence is handled through LocalAuth with a dedicated session directory structure to maintain WhatsApp authentication across restarts.

## Message Template System
A template engine (`templates.js`) provides localized message generation with built-in Hindi language support. The system includes utility functions for currency formatting (INR), date formatting (DD/MM/YY), and garment type translation from English to Hindi. This design pattern separates business logic from presentation and enables easy localization.

## Rate Limiting and Performance
The application implements Bottleneck.js for message throttling to comply with WhatsApp's rate limits and prevent API abuse. A configurable delay system (default 600ms) ensures messages are sent at appropriate intervals. Memory optimization techniques are applied throughout, including limited request body sizes and Chrome process management for cloud deployment constraints.

## Deployment Architecture
The system is designed for cloud-first deployment with specific optimizations for Railway and Azure App Service environments. It includes health check endpoints, graceful shutdown handling, and environment-specific configurations. The application supports both development and production modes with appropriate logging and error handling strategies.

# External Dependencies

## WhatsApp Integration
- **whatsapp-web.js**: Primary library for WhatsApp Web automation and message handling
- **puppeteer**: Browser automation engine for WhatsApp Web interface interaction
- **qrcode**: QR code generation for WhatsApp authentication process
- **qrcode-terminal**: Terminal-based QR code display for development environments

## Web Framework and Utilities
- **express**: HTTP server framework for REST API endpoints and webhook handling
- **axios**: HTTP client for external API communications and webhook processing
- **bottleneck**: Rate limiting and request throttling for WhatsApp message sending
- **dotenv**: Environment variable management for configuration and secrets

## Cloud Platform Integration
- **Railway**: Primary deployment platform with JSON configuration for build and deploy settings
- **Azure App Service**: Secondary deployment target with F1 tier optimizations
- **Chrome/Chromium**: Browser engine dependency managed through Puppeteer for WhatsApp Web automation

## Session and Data Management
The application uses file-based session storage through WhatsApp Web.js LocalAuth, with session data persisted in the `.wwebjs_auth` directory. QR codes for authentication are stored as both PNG files and data URLs for different access methods.