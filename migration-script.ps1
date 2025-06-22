# BMAD-METHODdb App Router Migration Script
# Run this script from the frontend/ directory

Write-Host "🚀 Starting BMAD-METHODdb App Router Migration..." -ForegroundColor Green

# Create app directory structure
Write-Host "📁 Creating app directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "app" -Force
New-Item -ItemType Directory -Path "app/dashboard" -Force
New-Item -ItemType Directory -Path "app/agents" -Force
New-Item -ItemType Directory -Path "app/templates" -Force
New-Item -ItemType Directory -Path "app/wizard/[sessionId]" -Force
New-Item -ItemType Directory -Path "app/projects/[id]/analytics" -Force
New-Item -ItemType Directory -Path "app/projects/[id]/documents" -Force

# Create lib directory (rename from utils)
Write-Host "📚 Setting up lib directory..." -ForegroundColor Yellow
if (Test-Path "utils") {
    Copy-Item -Path "utils/*" -Destination "lib/" -Recurse -Force
    Write-Host "✅ Copied utils to lib directory" -ForegroundColor Green
}

# Backup pages directory
Write-Host "💾 Creating backup of pages directory..." -ForegroundColor Yellow
Copy-Item -Path "pages" -Destination "pages-backup" -Recurse -Force
Write-Host "✅ Backup created at pages-backup/" -ForegroundColor Green

Write-Host "🎉 Directory structure created successfully!" -ForegroundColor Green
Write-Host "Next: Run the component migration commands..." -ForegroundColor Cyan
